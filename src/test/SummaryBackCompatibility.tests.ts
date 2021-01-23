import * as fs from 'fs';
import { assert, expect } from 'chai';
import { Change, StablePlace } from '../PersistedTypes';
import { DetachedSequenceId, EditId, NodeId } from '../Identifiers';
import { newEdit } from '../EditUtilities';
import { left, makeEmptyNode, setUpTestSharedTree, simpleTestTree } from './utilities/TestUtilities';
import { deserialize } from '../SummaryBackCompatibility';
import { SharedTreeSummaryBase } from '../Summary';

describe('Summary back compatibility', () => {
	const setupEditId = '9406d301-7449-48a5-b2ea-9be637b0c6e4' as EditId;
	const { tree: expectedTree, containerRuntimeFactory } = setUpTestSharedTree({
		initialTree: simpleTestTree,
		localMode: false,
		setupEditId,
	});
	const edit = newEdit([
		Change.build([makeEmptyNode('ae6b24eb-6fa8-42cc-abd2-48f250b7798f' as NodeId)], 0 as DetachedSequenceId),
		Change.insert(0 as DetachedSequenceId, StablePlace.before(left)),
	]);
	expectedTree.processLocalEdit({ ...edit, id: '48e38bb4-6953-4dbc-9811-9c69512f29c2' as EditId });
	containerRuntimeFactory.processAllMessages();

	const testedVersions = ['0.0.2'];

	testedVersions.forEach((version) => {
		it(`correctly loads version ${version}`, () => {
			// This path can't be found by the mocha test explorer but is found by `npm test`
			const serializeSummary = fs.readFileSync(`src/test/summary-files/${version}.json`, 'utf8');

			const { tree } = setUpTestSharedTree();

			const summary = deserialize(serializeSummary);
			assert.typeOf(summary, 'object');
			tree.loadSummary(summary as SharedTreeSummaryBase);

			expect(tree.equals(expectedTree)).to.be.true;
		});
	});
});
