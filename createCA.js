const fs = require('fs');
const opensslCert = require('node-openssl-cert');
const commandLineArgs = require('command-line-args');

const optionsDefs = [
	{ name: "caKeyPassword" , alias: "p", type: String },
	{ name: "caPath", type: String, defaultOption: true}
];

const options = commandLineArgs(optionsDefs);

var keyPassword = "verySecretPassword";
var caPath = "./ca";

if (!options.caKeyPassword) {
	console.log("You need to supply a CA Key pssword ('-p <password>')")
	process.exit(-1);
} else {
	keyPassword = options.caKeyPassword;
}

if (options.caPath) {
	caPath = options.caPath;
}

const openssl = new opensslCert();

const caKeyOptions = {
	encryption: {
		password: keyPassword,
		cipher: "des3"
	},
	rsa_keygen_bits: 2048,
	format: "PKCS8"
};

const csrOptions = {
	hash: "sha256",
	days: 3650,
	subject: {
		countryName: 'GB',
		stateOrProvinceName: 'Gloucestershire',
		localityName: 'Dursley',
		organizationName: 'Hardill',
		organizationalUnitName: 'CA',
		commonName: 'Hardill Certificate Authority'
	},
	extensions: {
		basicConstraints: {
			critical: true,
			CA: true,
			pathlen: 0
		},
		keyUsage: {
			critical: true,
			usages: [
				'digitalSignature',
				'keyEncipherment',
				'keyCertSign'
			]
		},
		extendedKeyUsage: {
			critical: true,
			usages: [
				'serverAuth',
				'clientAuth'
			]
		}
	}
};

if( !fs.existsSync('./ca')) {
	fs.mkdirSync('./ca');
	fs.mkdirSync('./ca/certs');
	fs.writeFileSync("./ca/index.txt", "", {encoding: 'utf8'});

	openssl.generateRSAPrivateKey(caKeyOptions, function(err, key, cmd){
		if (err){
			console.log(err);
			return;
		}
		openssl.generateCSR(csrOptions, key, keyPassword, function(err, csr, cmd){
			if (err){
				console.log(err);
				return;
			}
			openssl.selfSignCSR(csr, csrOptions, key, keyPassword, function(err, caCert, cmd){
				if (err){
					console.log(err);
					return;
				}	
				fs.writeFileSync('./ca/ca.key', key, { encoding: 'utf8'});
				fs.writeFileSync('./ca/ca.crt', caCert, { encoding: 'utf8'});
			});
		});
	});
};