import {expect,it} from 'vitest';
import {mergeProgress} from '@/lib/progress-sync';
it('preserves completed remote days against an older device',()=>{expect(mergeProgress({}, {days:{}}, {days:{1:{feedback:'Saved'}}})).toEqual({days:{1:{feedback:'Saved'}}});});
it('merges independent edits from two devices',()=>{expect(mergeProgress({a:1,b:1},{a:2,b:1},{a:1,b:3})).toEqual({a:2,b:3});});
it('keeps newer remote answers on conflicting edits',()=>{expect(mergeProgress({answer:'old'},{answer:'stale'},{answer:'new'})).toEqual({answer:'new'});});
it('retains edits made while saving',()=>{expect(mergeProgress({answer:'sent'},{answer:'server',day:2},{answer:'typed'})).toEqual({answer:'typed',day:2});});