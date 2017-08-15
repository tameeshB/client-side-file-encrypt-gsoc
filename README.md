![GSoC 2017](https://img.shields.io/badge/GSoC-2017-red.svg)
![Drupal 8.x](https://img.shields.io/badge/Drupal-8.x-blue.svg) 
![build status](https://gitlab.com/tameeshb/client-side-file-encrypt-gsoc/badges/8.x-1.x/build.svg)
# Client-side File encryption for implementing a zero-knowledge system  
## Google Summer of Code Project for Drupal  
#### Student: Tameesh Biswas (@tameeshb)  
#### Mentor: Colan Schwartz (@colan)  
  
## Objective  
    
This project will involve building a complete module for Drupal 8 site to make
 it a zero-knowledge system using
 front-end JS encryption so that the users can rely on the site when uploading 
 sensitive files, including images 
 on confidential posts, not having to worry about data being stolen in case the
  server gets compromised.

## Installation instructions

### The JavaScript libraries 

There are several JS dependencies that this module is dependent upon, these
will need to be downloaded to the /libraries/client_side_file_crypto/
directory in the Drupal root. These should be saved by the name as written
 below:  
[sjcl.js](http://bitwiseshiftleft.github.io/sjcl/sjcl.js)  
[jsencrypt.js](http://travistidwell.com/jsencrypt/bin/jsencrypt.js)  
[cryptojs.js](https://github.com/brix/crypto-js/blob/develop/src/aes.js)  
