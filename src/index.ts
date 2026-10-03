// Root barrel export for backwards compatibility
export * from './core';
export * from './ns';

import simulator from './core/simulator';
import simulatorUVA from './core/uva/UVAsimulator';
import downloads from './ns/downloads';
import loadActivity from './load-activity';
import arrows from './core/arrows';
import {
	uploadNotes,
	uploadActivity,
	uploadEntries,
	uploadLogs,
	uploadDeviceStatus,
	uploadTreatments,
} from './ns/uploads';
import { deleteDeviceStatus } from './ns/delete';

export {
	arrows,
	simulator,
	downloads,
	loadActivity,
	simulatorUVA,
	uploadEntries,
	uploadActivity,
	uploadNotes,
	uploadLogs,
	uploadDeviceStatus,
	uploadTreatments,
	deleteDeviceStatus,
};

export default simulator;
