# Personal Web Certificate Authority

This is a small web front end for creating certifacates signed by a supplied CA cert and key.

It was written to run on a Raspberry Pi Zero running as a USB Ethernet gadget to provide a 
"secure" offline CA. Details can be found [here](https://www.hardill.me.uk/wordpress/2020/02/10/a-personal-offline-certifcate-authority/)

## Configure

You can configure the service by editing the `options.js` file

```
module.exports = {
	caCertPath: "./ca.crt",
	caKeyPath: "./ca.key",
	life: 365,
	port: 80
}
```

You can set the path to the CA's cert and key, set the default certificate life in days and 
the port the service will listen on.

## Usage

Just point your browser at the correct host/port and then pick from either a host or personal
certificate. Fill in the required fields including the passphrase for the CA key and a 
passsphase for the output P12 file.

## TODO

- Add a LOT of error handling
- Allow the uploading of an old cert (to extract the Subject info) to create new
- Add more constraints to cert types
- Add support to update CA serial/csr data