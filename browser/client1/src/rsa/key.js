const BigInteger = require('jsbn').BigInteger
//JS的最大计算精度为9007199254740991，超过之后所有大数计算将无效

var Len = new BigInteger('2').pow(new BigInteger('128'))
var seed = '777777777777777';
var checkLun = 500;
function RsaKey(seed) {
    this.seed = 'number' === typeof seed ? seed : Number(seed)
}

RsaKey.prototype.generate = function () {
    var p = new BigInteger(seed),
        q = new BigInteger(seed),
        step = new BigInteger('1');

    while (true) {
        if (p.isProbablePrime(checkLun)) {
            console.log('Prime :', p.toString())
            break;
        } else {
            p = p.add(step);
        }
    }

    while (true) {
        if (q.isProbablePrime(checkLun)) {
            console.log('Prime :', q.toString())
            break;
        } else {
            q = q.subtract(step);
        }
    }

    var n = p.multiply(q).mod(Len);
    var fn = p.subtract(BigInteger.ONE).multiply(q.subtract(BigInteger.ONE)).mod(Len)

    console.log('Len :' , fn.bitLength())

    console.log('n :', n.toString())
    console.log('f(n) :', fn.toString())
    var e = new BigInteger('3');

    while (true) {
        if (0 === step.compareTo(fn.gcd(e))) {
            console.log('E :', e.toString())
            break;
        } else {
            e = e.add(BigInteger.ONE);
        }
    }
    var x, y;

    function ex_gcd(a, b) {
        if (b.intValue() === 0) {
            x = new BigInteger("1");
            y = new BigInteger("0");
            return a;
        }
        var ans = ex_gcd(b, a.mod(b));
        var temp = x;
        x = y;
        y = temp.subtract(a.divide(b).multiply(y));
        return ans;
    }

    function cal(a, k) {
        var gcd = ex_gcd(a, k);
        if (BigInteger.ONE.mod(gcd).intValue() !== 0) {
            return new BigInteger("-1");
        }
        x = x.multiply(BigInteger.ONE.divide(gcd));
        k = k.abs();
        var ans = x.mod(k);
        if (ans.compareTo(BigInteger.ZERO) < 0) ans = ans.add(k);
        return ans;
    }

    var d = cal(e, fn)
    console.log("D :", d.toString());

    var pk = {n, e}, sk = {n, d}


    var m = new BigInteger('22');
    console.log("M :", m.toString());
    var c = m.modPow(e, n);
    console.log("C :", c.toString());

    var text = c.modPow(d, n);
    console.log("M :", text.toString());


    /*console.log(Math.pow(2, 32));
    console.log(2 << 32);

    console.log(a);*/

    /*while(true){
        p++;
        console.log('p: ', p);
        if(this.isPrime(p)) break;
        this.Len < p && (p = 3);
    }
    while(true){
        if(this.isPrime(q--)) break;
        3 > q && (q = RsaKey.prototype.Len - 3);
        console.log('q: ', q);
    }*/
}
RsaKey.prototype.isPrime = function (n) {
    if (n < 0x2) return false;
    if (0x2 === n) return true;
    if (0x0 === n % 0x2) return false;
    for (var i = 0x3; i < n; i += 0x2)
        if (0x0 === n % i) return false;
    return true;
}

export default RsaKey