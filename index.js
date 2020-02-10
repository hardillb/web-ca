const fs = require('fs');
const express = require('express');
const opensslCert = require('node-openssl-cert');

const app = express();

const openssl = new opensslCert();

const caCrt = fs.readFileSync("./ca.crt")
const caKey = fs.readFileSync("./ca.key");

openssl.generateRSAPrivateKey({}, function(err, key, cmd){
	//console.log(key);
	const csrOptions = {
		subject: {
			countryName: "GB",
			stateOrProvinceName: "Gloucester",
			organizationName: 'Hardill',
			commonName: "hardill.me.uk"
		},
		extensions: {
			basicConstraints: {
				critical: true,
				CA: false
			},
			SANs: {
				DNS: [
					'hardill.me.uk'
				]
			}
		}
	};

	openssl.generateCSR(csrOptions, key, "", function(err, csr, cmd) {
		//console.log(csr);
		openssl.getCSRInfo(csr, function(err, attrs, cmd) {
			// console.log(attrs);
			openssl.CASignCSR(csr,{days: 365, extensions: attrs.extensions },false, caCrt, caKey, "passw0rd", function(err, crt, cmd){
				console.error(cmd);
				console.log(crt);
				openssl.createPKCS12(crt,key,"","passw0rd",caCrt,function(err, pfx, cmd){
					fs.writeFileSync("./test.p12", pfx);
				});
			});
		});
		
	});
});

app.post('/newCert',function(req,res){

});