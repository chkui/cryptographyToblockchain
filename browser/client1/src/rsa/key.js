import {info} from '../util/log'
const BigInteger = require('jsbn').BigInteger
/*JS的最大计算精度为9007199254740991，超过之后所有大数计算将无效*/
/**
 * RSA密钥对
 */

/**
 * 生成种子的最大长度
 * @type {*|number}
 * @private
 */
const Config_SeedLen = new BigInteger('2').pow(new BigInteger('128')),
    /**
     * 密钥或加密数据的最大长度，n的边界
     * @type {*|number}
     */
    Config_KeyLen = new BigInteger('2').pow(new BigInteger('256')),
    /**
     * millerRabin算法的检查次数
     * @type {number}
     */
    Config_millerRabinCheckNum = 1500,
    Config_Step = new BigInteger('1'); //算法的步进长度，
function RsaKey() {
    let sk = {k: false, n: false}, pk = {k: false, n: false};

    this.getSK = function () {
        return sk;
    };
    this.getPK = function () {
        return pk;
    };
    this.setSK = function (input) {
        sk = input;
    };
    this.setPK = function (input) {
        pk = input;
    };
}

/**
 * 生成RSA密钥
 * @param {string} seedP p的种子
 * @param {string} seedQ q的种子
 * @param {string} seedE e的种子
 */
RsaKey.prototype.generate = function (seedP, seedQ, seedE) {
    let p, //素数1
        q, //素数2
        n, //p*q
        fn,//(p-1)(q-1)
        e, //PK
        d; //SK

    p = genPrime(seedP, 'P');
    q = genPrime(seedQ, 'Q');

    n = p.multiply(q).mod(Config_KeyLen);
    info('n: ', n.toString(), '. length: ', n.bitLength());
    fn = p.subtract(BigInteger.ONE).multiply(q.subtract(BigInteger.ONE)).mod(Config_KeyLen);
    info('f(n): ', n.toString(), '. length: ', fn.bitLength());
    e = genRelativelyPrime(fn, seedE);

    d = extEuclidean(e, fn);
    console.log("D :", d.toString());

    this.setSK({e,n})
    this.setPK({d,n})
};

/**
 * 欧几里得扩展算法，用于推导RSA的d
 * @param e
 * @param fn
 */
function extEuclidean(e, fn) {
    let x, y, iterCount = 0;
    function ex_gcd(a, b) {
        if (b.intValue() === 0) {
            x = new BigInteger("1");
            y = new BigInteger("0");
            return a;
        }
        const ans = ex_gcd(b, a.mod(b));
        const temp = x;
        x = y;
        y = temp.subtract(a.divide(b).multiply(y));
        iterCount++;
        return ans;
    }
    const gcd = ex_gcd(e, fn);
    if (BigInteger.ONE.mod(gcd).intValue() !== 0) {
        return new BigInteger("-1");
    }
    x = x.multiply(BigInteger.ONE.divide(gcd));
    fn = fn.abs();
    let ans = x.mod(fn);
    if (ans.compareTo(BigInteger.ZERO) < 0) ans = ans.add(fn);
    info('Generate D with E=', e.toString(), ', fn=', fn.toString(), '. Result :', ans.toString(), '. Iteration Count:', iterCount);
    return ans;
}

// private
/* * 生成素数，采用上线发散式的搜索
 * @param seed
 * @param name 日志输出名称
 * @returns {*}
 */
function genPrime(seed, name) {
    let result, add = new BigInteger(seed).mod(Config_SeedLen), sub = add.clone(), checkCount = 0;
    while (!(result = checkPrime(add)) || !(result = checkPrime(sub))) {
        add = add.add(Config_Step)
        sub = sub.subtract(Config_Step)
        checkCount++;
    }
    info('Generate prime ', name ? name : '', ':', result.toString(), '. Iteration Count:', checkCount);
    return result;
}

/**
 * 检查素数
 * @param prime
 * @returns {BigInteger|boolean}
 */
function checkPrime(prime) {
    if (prime.isProbablePrime(Config_millerRabinCheckNum)) {
        return prime;
    } else {
        return false;
    }
}

/**
 * 生成与fn互质的数
 * @param fn
 * @param seed
 * @returns {*}
 */
function genRelativelyPrime(fn, seed) {
    let result, add = new BigInteger(seed).mod(Config_SeedLen), sub = add.clone(), checkCount = 0;

    while (!(result = checkRelativelyPrime(fn, add)) || !(result = checkRelativelyPrime(fn, sub))) {
        add = add.add(Config_Step)
        sub = sub.subtract(Config_Step)
        checkCount++;
    }
    info('Generate E(gcd) with ', fn.toString(), ': ', result.toString(), '. Iteration Count:', checkCount);
    return result;
}

/**
 * 检查互质
 * @param fn
 * @param num
 * @returns {*}
 */
function checkRelativelyPrime(fn, num) {
    if (0 === BigInteger.ONE.compareTo(fn.gcd(num))) {
        return num;
    } else {
        return false;
    }
}

export default RsaKey