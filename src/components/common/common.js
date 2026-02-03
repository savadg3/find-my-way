
import Hashids from 'hashids';

const hashids = new Hashids('', 10);
function encode(encid) {
  const id = encid ? Number(+encid) : 0;
  const encodedId = id ? hashids.encode(id) : 0;
  return encodedId;
}
function decode(decid) {
  const id = decid ?? '';
  const decodeId = id ? +hashids.decode(id) : 0;
  return decodeId;
}
export default {
  encode,
  decode,


};
