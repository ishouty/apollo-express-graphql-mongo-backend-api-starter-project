#!/bin/bash

pwd
cp src/config/$1.env ./.env
echo "Copied $1.env config environment"