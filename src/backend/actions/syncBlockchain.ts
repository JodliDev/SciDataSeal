import {DbType} from "../database/setupDb.ts";
import getBlockchain from "./getBlockchain.ts";
import {Logger} from "../Logger.ts";

/**
 * Sends pending data logs to the blockchain and checks the confirmation status of
 * previously sent logs and updates their confirmation status as needed.
 *
 * @param {DbType} db - The database instance used for querying and updating DataLog records.
 */
export default async function syncBlockchain(db: DbType): Promise<void> {
	const confirmedNum = await confirmDataInBlockchain(db); // We confirm first because sendData also tries to confirm data
	const sentNum = await sendDataToBlockchain(db);
	
	Logger.log(`Confirmed ${confirmedNum[0]}/${confirmedNum[1]} data logs and sent ${sentNum[0]}/${sentNum[1]} data logs to the blockchain`);
}

async function sendDataToBlockchain(db: DbType): Promise<[number, number]> {
	async function saveLogsAsBundle(logs: typeof dataLogsToSend): Promise<boolean> {
		try {
			const firstLog = logs[0];
			const data = logs.map(log => log.data);
			const blockChain = getBlockchain(firstLog.blockchainType);
			
			const signatures = await blockChain.saveMessage(firstLog.privateKey, firstLog.blockchainDenotation, data, firstLog.isHeader, firstLog.dataKey);
			const signaturesJson = JSON.stringify(signatures);
			const isConfirmed = await blockChain.isConfirmed(signatures);
			
			for(const log of logs) {
				await db.updateTable("DataLog")
					.set({
						wasSent: true,
						wasConfirmed: isConfirmed,
						signatures: signaturesJson,
						hasError: "",
						data: ""
					})
					.where("logId", "=", log.logId)
					.execute();
			}
			return true;
		} catch(e) {
			const msg = e instanceof Error ? e.message : e?.toString() ?? "Unknown error";
			Logger.error(`Error while sending data to blockchain (logIds: ${JSON.stringify(logs.map(log => log.logId))}): ${msg}`);
			
			for(const log of logs) {
				await db.updateTable("DataLog")
					.set({
						hasError: msg,
					})
					.where("logId", "=", log.logId)
					.execute();
			}
			
			return false;
		}
	}
	async function saveHeaderAndDataLogs(logs: typeof dataLogsToSend) {
		const split = logs.reduce((acc, log) => {
			if(log.isHeader) {
				acc.header.push(log);
			}
			else {
				acc.data.push(log);
			}
			return acc;
		}, {header: [] as typeof dataLogsToSend, data: [] as typeof dataLogsToSend});
		
		if(split.header.length) {
			if(await saveLogsAsBundle(split.header)) {
				successful += split.header.length;
			}
		}
		if(split.data.length) {
			if(await saveLogsAsBundle(split.data)) {
				successful += split.data.length;
			}
		}
	}
	
	
	const dataLogsToSend = await db.selectFrom("DataLog")
		.innerJoin("Questionnaire", "Questionnaire.questionnaireId", "DataLog.questionnaireId")
		.innerJoin("BlockchainAccount", "BlockchainAccount.blockchainAccountId", "DataLog.blockchainAccountId")
		.select(["logId", "data", "isHeader", "dataKey", "hasError", "blockchainType", "privateKey", "blockchainDenotation", "Questionnaire.questionnaireId as questionnaireId"])
		.where("wasSent", "=", false)
		.execute();
	
	const grouped = Object.groupBy(
		dataLogsToSend,
		log => log.questionnaireId
	);
	
	let successful = 0;
	for(const questionnaireId in grouped) {
		const logs = grouped[questionnaireId]!;
		
		// We save faulty logs separately because they are likely to fail, which will prevent further logs to be saved as well
		const split = logs.reduce((acc, log) => {
			if(log.hasError) {
				acc.withError.push(log);
			}
			else {
				acc.withoutError.push(log);
			}
			return acc;
		}, {withError: [] as typeof dataLogsToSend, withoutError: [] as typeof dataLogsToSend});
		
		if(split.withError.length) {
			await saveHeaderAndDataLogs(split.withError);
		}
		if(split.withoutError.length) {
			await saveHeaderAndDataLogs(split.withoutError);
		}
	}
	
	return [successful, dataLogsToSend.length];
}

async function confirmDataInBlockchain(db: DbType): Promise<[number, number]> {
	const dataLogsForConfirmation = await db.selectFrom("DataLog")
		.innerJoin("BlockchainAccount", "BlockchainAccount.blockchainAccountId", "DataLog.blockchainAccountId")
		.select(["logId", "DataLog.blockchainAccountId", "blockchainType", "signatures"])
		.where("wasSent", "=", true)
		.where("wasConfirmed", "=", false)
		.limit(100)
		.execute();
	
	const alreadyConfirmed: Record<string, boolean> = {};
	
	let successful = 0;
	for(const log of dataLogsForConfirmation) {
		try {
			const blockChain = getBlockchain(log.blockchainType);
			const signatures: string[] = JSON.parse(log.signatures);
			const unconfirmed = signatures.filter(sig => !alreadyConfirmed[sig]); // Should always be all or nothing
			
			if(!unconfirmed.length) {
				continue;
			}
			const wasConfirmed = await blockChain.isConfirmed(unconfirmed);
			
			if(wasConfirmed) {
				await db.updateTable("DataLog")
					.set({
						wasConfirmed: wasConfirmed,
						hasError: "",
					})
					.where("logId", "=", log.logId)
					.execute();
				
				for(const sig of unconfirmed) {
					alreadyConfirmed[sig] = true;
				}
			}
			++successful;
		} catch(e) {
			const msg = e instanceof Error ? e.message : e?.toString() ?? "Unknown error";
			Logger.error(`Error while confirming data (logId: ${log.logId}): ${msg}`);
			
			await db.updateTable("DataLog")
				.set({
					hasError: msg,
				})
				.where("logId", "=", log.logId)
				.execute();
		}
	}
	
	return [successful, dataLogsForConfirmation.length];
}