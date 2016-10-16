#!/bin/bash

# print outputs and exit on first failure
set -xe

if [ $TRAVIS_BRANCH == "master" ] ; then

    git remote add deploy ssh://root@ldso.diogomoura.me/var/repo/ldso.git
    git push deploy

else

    echo "No deploy script for branch '$TRAVIS_BRANCH'"

fi