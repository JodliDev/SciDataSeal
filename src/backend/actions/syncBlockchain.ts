import {DbType} from "../database/setupDb.ts";
import getBlockchain from "./getBlockchain.ts";
import {Logger} from "../Logger.ts";

/**
 * Retrieves data logs that are ready to be sent to the blockchain
 * and updates their status in the database. It also checks the confirmation status of
 * previously sent logs and updates their confirmation status as needed.
 *
 * @param {DbType} db - The database instance used for querying and updating DataLog records.
 */
export default async function syncBlockchain(db: DbType): Promise<void> {
	const dataLogsToSend = await db.selectFrom("DataLog")
		.innerJoin("Questionnaire", "Questionnaire.questionnaireId", "DataLog.questionnaireId")
		.innerJoin("BlockchainAccount", "BlockchainAccount.blockchainAccountId", "DataLog.blockchainAccountId")
		.select(["logId", "data", "isHeader", "blockchainType", "privateKey", "blockchainDenotation"])
		.where("wasSent", "=", false)
		.limit(100)
		.execute();
	
	const dataLogsForConfirmation = await db.selectFrom("DataLog")
		.innerJoin("BlockchainAccount", "BlockchainAccount.blockchainAccountId", "DataLog.blockchainAccountId")
		.select(["logId", "DataLog.blockchainAccountId", "blockchainType"])
		.where("wasSent", "=", true)
		.where("wasConfirmed", "=", false)
		.limit(100)
		.execute();
	
	Logger.log(`Found ${dataLogsToSend.length} logs to send and ${dataLogsForConfirmation.length} logs for confirmation.`);
	
	for(const log of dataLogsToSend) {
		try {
			const blockChain = getBlockchain(log.blockchainType);
			const signatures = await blockChain.saveMessage(log.privateKey, log.blockchainDenotation, log.data, log.isHeader);
			
			await db.updateTable("DataLog")
				.set({
					wasSent: true,
					wasConfirmed: await blockChain.isConfirmed(),
					signatures: JSON.stringify(signatures),
					data: ""
				})
				.where("logId", "=", log.logId)
				.execute();
		} catch(e) {
			Logger.error(`Error while sending data to blockchain (logId: ${log.logId}): ${e}`);
		}
	}
	
	for(const log of dataLogsForConfirmation) {
		try {
			const blockChain = getBlockchain(log.blockchainType);
			const wasConfirmed = await blockChain.isConfirmed();
			
			if(wasConfirmed) {
				await db.updateTable("DataLog")
					.set({
						wasConfirmed: wasConfirmed,
					})
					.where("logId", "=", log.logId)
					.execute();
			}
		} catch(e) {
			Logger.error(`Error while confirming data (logId: ${log.logId}): ${e}`);
		}
	}
}