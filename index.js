const fs = require('fs');
const options = require('./options');
const express = require('express');
const bodyParser = require('body-parser');
const opensslCert = require('node-openssl-cert');

const app = express();

app.use(bodyParser.json());
app.use(express.static('static'));

const openssl = new opensslCert();

const caCrt = fs.readFileSync(options.caCertPath, "utf-8");
const caKey = fs.readFileSync(options.caKeyPath, "utf-8");

console.log(options);

app.post('/newCert',function(req,res){

	const opts = req.body;
	const csrOptions = opts.csr;
	const pkcs12Pass = opts.exportPassword;
	const caKeyPassword = opts.caKeyPassword

	//set default for error
	res.set("Content-Type", "application/json");

	openssl.generateRSAPrivateKey({}, function(err, key, cmd){
		console.log("gen key");
		if (err) {
			console.log(cmd);
			console.log(err);
			var error = {
				cmd: cmd,
				err: err
			}
			res.status(500).send(error);
			return;
		}

		openssl.generateCSR(csrOptions, key, false, function(err, csr, cmd) {
			console.log("generte csr")
			if (err) {
				console.log(cmd);
				console.log(err);
				var error = {
					cmd: cmd,
					err: err
				}
				res.status(500).send(error);
				return;
			}
			openssl.getCSRInfo(csr, function(err, attrs, cmd) {
				console.log("getCSRInfo");
				if (err) {
					console.log(cmd);
					console.log(err);
					var error = {
						cmd: cmd,
						err: err
					}
					res.status(500).send(error);
					return;
				}
				openssl.CASignCSR(csr,{days: options.life, extensions: attrs.extensions },options.caPath, caCrt, caKey, caKeyPassword, function(err, crt, cmd){
					console.log("sign csr")
					if (err) {
						console.log(cmd);
						console.log(err);
						var error = {
							cmd: cmd,
							err: err
						}
						res.status(500).send(error);
						return;
					}
					openssl.createPKCS12(crt,key,false,pkcs12Pass,caCrt,function(err, pfx, cmd){
						console.log("create p12");
						if (!err) {
							res.set("Content-Type", "application/x-pkcs12");
							var filename = csrOptions.subject.commonName + ".p12";
							res.set("Content-Disposition", 'attachment; filename="' + filename + '"');
							res.status(201);
							res.send(pfx);
						} else {
							console.log(cmd);
							console.log(err);
							var error = {
								cmd: cmd,
								err: err
							}
							res.status(500).send(error);
						}
					});
				});
			});
			
		});
	});
});

app.listen(options.port, () => {
	console.log("running");
})