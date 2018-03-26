const BigInteger = require('jsbn').BigInteger

import GenKey from './rsa/key'
const key = new GenKey(1234567);
key.generate('1231231231232312912897312678312','9128973126783126575677645667765','6575677645667765');
const text = new BigInteger('23522678');
console.log("Text :", text.toString());
const sk = key.getSK()
const pk = key.getPK()
const enText = text.modPow(sk.e, sk.n);
console.log("enText :", enText.toString());

const deText = enText.modPow(pk.d, pk.n);
console.log("M :", deText.toString());