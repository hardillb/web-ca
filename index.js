const fs = require('fs');
const options = require('./options');
const express = require('express');
const bodyParser = require('body-parser');
const opensslCert = require('node-openssl-cert');

const app = express();

app.use(bodyParser.json());

const openssl = new opensslCert();

const caCrt = fs.readFileSync(options.caCertPath, "utf-8");
const caKey = fs.readFileSync(options.caKeyPath, "utf-8");

console.log(options);

app.post('/newCert',function(req,res){

	const opts = req.body;
	const csrOptions = opts.csr;
	const pkcs12Pass = opts.exportPassword;
	const caKeyPassword = opts.caKeyPassword

	openssl.generateRSAPrivateKey({}, function(err, key, cmd){
		// console.log("gen key");
		// console.log(cmd);
		// console.log("error: ", err);

		openssl.generateCSR(csrOptions, key, false, function(err, csr, cmd) {
			// console.log("generte csr")
			// console.log(cmd);
			// console.log("error: ", err);
			// console.log(csr);
			openssl.getCSRInfo(csr, function(err, attrs, cmd) {
				// console.log("getCSRInfo");
				// console.log(cmd);
				// console.log("error: ",err);
				openssl.CASignCSR(csr,{days: 365, extensions: attrs.extensions },false, caCrt, caKey, caKeyPassword, function(err, crt, cmd){
					// console.log("sign csr")
					// console.log(cmd);
					// console.log("error: ",err);
					openssl.createPKCS12(crt,key,false,pkcs12Pass,caCrt,function(err, pfx, cmd){
						// console.log("create p12");
						// console.log(cmd)
						// console.log("error: ", err);
						res.set("Content-Type", "application/x-pkcs12");
						res.send(pfx);
					});
				});
			});
			
		});
	});
});

app.listen(3000, () => {
	console.log("running");
})