package pkg

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"sync"
)

var (
	privateKey *rsa.PrivateKey
	publicKeyPEM string
	rsaOnce    sync.Once
)

func InitRSA() error {
	var err error
	rsaOnce.Do(func() {
		privateKey, err = rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			return
		}
		pubKeyBytes, e := x509.MarshalPKIXPublicKey(&privateKey.PublicKey)
		if e != nil {
			err = e
			return
		}
		pubPem := pem.EncodeToMemory(&pem.Block{
			Type:  "PUBLIC KEY",
			Bytes: pubKeyBytes,
		})
		publicKeyPEM = string(pubPem)
	})
	return err
}

func GetPublicKeyPEM() string {
	return publicKeyPEM
}

func RSADecrypt(ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}
	plaintext, err := rsa.DecryptPKCS1v15(rand.Reader, privateKey, data)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}
