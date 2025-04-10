import { TrieTree } from './trieTree';


/**
 * TrieSearch
 *
 * Manages a searchable trie index for plume identifiers.
 * Designed to support autocomplete-style prefix search on structured IDs.
 * For example: `Mexico_Durango_BV1_BV1-1` allows search by country, state, region, or plume ID.
 */
export class TrieSearch {
  constructor() {
    this.trieTree = new TrieTree();
  }

  addItems(items) {
    if (!items || !items.length) {
      return;
    }
    // add items to the tire tree
    items.forEach((item) => {
      // here item is in the format <country>_<state>_<region>_<plume_id>. e.g. Mexico_Durango_BV1_BV1-1
      const capitalizedItem = item.toUpperCase();

      // Algorithm:
      // basically we want to create tire tree for, all of these
      // <country>_<state>_<region>_<plume_id></plume_id>
      // <state>_<region>_<plume_id></plume_id>
      // <region>_<plume_id></plume_id>
      // <plume_id></plume_id>
      // </plume_id>

      // sliding window with fixed end and moving start. start jumping to next _
      let start = 0;
      let end = capitalizedItem.length - 1;
      this.trieTree.insert(capitalizedItem, item);
      while (start < end) {
        if (capitalizedItem[start] === '_') {
          let word = capitalizedItem.slice(start + 1, end + 1);
          this.trieTree.insert(word, item);
        }
        start += 1;
      }
    });
  }

  getRecommendations(prefix) {
    if (!prefix) {
      return [];
    }
    prefix = prefix.toUpperCase();
    // return all recommendations
    const results = this.trieTree.search(prefix);
    return [...new Set(results)];
  }
}
