#!/bin/bash

# print outputs and exit on first failure
set -xe

if [ $TRAVIS_BRANCH == "master" ] ; then

    git checkout master
    git remote add deploy ssh://travis@ldso.diogomoura.me/var/repo/ldso.git
    git push deploy master

else

    echo "No deploy script for branch '$TRAVIS_BRANCH'"

fi