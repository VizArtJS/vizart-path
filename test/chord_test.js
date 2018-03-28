import Matrix from '../src/chord/Matrix';
import { strictEqual } from 'assert';

describe('chord', () => {
  it('matrix', () => {
      const matrix = new Matrix();

      strictEqual(matrix._id, 0);
  });


});
