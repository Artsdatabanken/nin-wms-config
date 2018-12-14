#!/bin/bash
latestRelease=`./getLatestReleaseFromRepo.sh Artsdatabanken/kverna`
latestReleaseUrl=https://github.com/Artsdatabanken/kverna/releases/download/$latestRelease/farger.tar.gz

if [ ! -d colors ]; then 
	mkdir colors 
fi

echo Fetching $latestReleaseUrl
curl -L https://github.com/Artsdatabanken/kverna/releases/download/$latestRelease/farger.tar.gz -o colors/farger.tar.gz

echo Unzipping json
tar xvzf colors/farger.tar.gz -C colors

