
const { Sequelize, QueryTypes } = require("sequelize");
const { db } = require("../models");

async function findByPkRecord(model, id, options = {}) {
	try {
		const record = await model.findByPk(id, {
			attributes:
				options.attributes && options.attributes.length
					? options.attributes
					: undefined,
			include:
				options.include && options.include.length
					? options.include
					: undefined,
			raw: options.raw || false,
			paranoid: options.paranoid !== undefined ? options.paranoid : true,
		});
		return record;
	} catch (error) {
		console.error("Error finding record by primary key:", error);
		throw error;
	}
}

async function createRecord(model, data) {
	try {
		console.log("ModelName : ", model);
		console.log("Data ----------------2 2  2: ", data);
		const newRecord = await model.create(data);
		return newRecord;
	} catch (error) {
		console.error("Error creating record:", error);
		throw error;
	}
}

async function createBulkRecord(model, data) {
	try {
		console.log("ModelName:", model);

		// Check if data is an array
		const isArray = Array.isArray(data);

		// Perform bulk create if data is an array, otherwise create a single record
		const newRecords = isArray
			? await model.bulkCreate(data)
			: await model.create(data);

		return newRecords;
	} catch (error) {
		console.error("Error creating record:", error);
		throw error;
	}
}

async function destroyRecord(model, id, whereParam = null) {
	try {
		let where = {};
		if (!whereParam) where = { id };
		else where = whereParam;
		const result = await model.destroy({
			where,
		});

		return result;
	} catch (error) {
		console.error("Error destroying record by primary key:", error);
		throw error;
	}
}

async function findRecords(model, options = {}) {
	try {
		let parameters = {
			where: options.where || {},
			offset: options.offset || 0,
			limit: options.limit || 10,
			attributes:
				options.attributes && options.attributes.length
					? options.attributes
					: undefined,
			include:
				options.include && options.include.length
					? options.include
					: undefined,
			raw: options.raw || false,
			group: options.group || undefined,
			order: options.order || undefined,
			having: options.having || undefined,
			paranoid: options.paranoid !== undefined ? options.paranoid : true,
			logging: options.logging ? console.log : false,
		};
		// console.log(parameters);
		const records = await model.findAll(parameters);

		return records;
	} catch (error) {
		console.error("Error finding records:", error);
		throw error;
	}
}

async function findUniqueRecord(model, options) {
	try {
		let parameters = {
			where: options.where || {},
			attributes:
				options.attributes && options.attributes.length
					? options.attributes
					: undefined,
			include:
				options.include && options.include.length
					? options.include
					: undefined,
			raw: options.raw || false,
			group: options.group || undefined,
			order: options.order || undefined,
			having: options.having || undefined,
			paranoid: options.paranoid !== undefined ? options.paranoid : true,
		};
		// console.log(`\n\n parameters : ${parameters}`);
		const records = await model.findOne(parameters);

		return records;
	} catch (error) {
		console.error("Error finding records:", error);
		throw error;
	}
}

async function countRecords(model, options = {}) {
	try {
		const count = await model.count({
			where: options.where || {},
			paranoid: options.paranoid !== undefined ? options.paranoid : true,
		});

		return count;
	} catch (error) {
		console.error("Error counting records:", error);
		throw error;
	}
}

async function updateRecords(model, updateValues, options = {}) {
	try {
		const result = await model.update(updateValues, {
			where: options.where || {},
			paranoid: options.paranoid !== undefined ? options.paranoid : true,
		});
		console.log("Result : ", result);

		return result;
	} catch (error) {
		console.error("Error updating records:", error);
		throw error;
	}
}

async function findAndCountAllRecords(model, options = {}) {
	try {
		const result = await model.findAndCountAll({
			where: options.where || {},
			offset: options.offset || 0,
			limit: options.limit || 10,
			attributes:
				options.attributes && options.attributes.length
					? options.attributes
					: undefined,
			include:
				options.include && options.include.length
					? options.include
					: undefined,
			raw: options.raw || false,
			group: options.group || undefined,
			having: options.having || undefined,
			order: options.order || undefined,
			paranoid: options.paranoid !== undefined ? options.paranoid : true,
			logging : console.log
		});

		return result;
	} catch (error) {
		console.error("Error finding and counting records:", error);
		throw error;
	}
}

async function executeQuery(query) {
	try {
		return await db.sequelize.query(query, {
			type: QueryTypes.SELECT,
		});
	} catch (err) {}
}

async function fetchAllRecordsWithCount(model, options = {}) {
	try {
		let result = await model.findAndCountAll({
			where: options.where || {},
			offset: options.offset || 0,
			limit: options.limit || 1000,
			attributes: options.attributes || undefined,
			include: options.include || undefined,
			raw: options.raw || false,
			group: options.group || undefined,
			having: options.having || undefined,
			order: options.order || undefined,
			paranoid: options.paranoid !== undefined ? options.paranoid : true,
			// logging: console.log,
		});

		const { count, rows } = result;
		const totalCount = count;
		const data = rows;

		if (totalCount > options.limit) {
			// Calculate the number of batches
			const numBatches = Math.ceil(totalCount / options.limit);
			const batchData = [];
			// Fetch data in batches
			for (let i = 0; i < numBatches; i++) {
				const batchOffset = i * options.limit;
				const batchResult = await model.findAll({
					where: options.where || {},
					offset: batchOffset,
					limit: options.limit,
					attributes: options.attributes || undefined,
					include: options.include || undefined,
					raw: options.raw || false,
					group: options.group || undefined,
					having: options.having || undefined,
					order: options.order || undefined,
					logging: console.log,
				});
				batchData.push(...batchResult);
			}

			result = { count: totalCount, rows: batchData };
		}

		return result;
	} catch (error) {
		console.error("Error finding and counting records:", error);
		throw error;
	}
}

async function fetchRecords(model, options = {}) {
	try {
		const queryOptions = {
			where: options.where || {},
			attributes: options.attributes || undefined,
			include: options.include || undefined,
			raw: options.raw || false,
			group: options.group || undefined,
			having: options.having || undefined,
			order: options.order || undefined,
			paranoid: options.paranoid !== undefined ? options.paranoid : true,
			logging: console.log, // Keep for debugging
		};

		// Apply pagination **only if limit is provided**
		if (options.limit !== undefined && options.offset !== undefined) {
			queryOptions.limit = options.limit;
			queryOptions.offset = options.offset;
		}

		// Fetch records
		const result = await model.findAll(queryOptions);

		// Count total records matching the criteria
		const totalCount = await model.count({ where: options.where || {} });

		return { count: totalCount, rows: result };
	} catch (error) {
		console.error("Error fetching records:", error);
		throw error;
	}
}


module.exports = {
	findByPkRecord,
	createRecord,
	destroyRecord,
	findRecords,
	countRecords,
	updateRecords,
	findAndCountAllRecords,
	findUniqueRecord,
	executeQuery,
	fetchAllRecordsWithCount,
	createBulkRecord,
	fetchRecords
};
