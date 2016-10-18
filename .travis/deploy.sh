#!/bin/bash

# print outputs and exit on first failure
set -xe

if [ $TRAVIS_BRANCH == "master" ] ; then

    git checkout master
    git remote add deploy ssh://root@ldso.diogomoura.me/var/repo/ldso.git
    rm -f .gitignore
    git add .
    git status # debug
    git commit -m "Deploy compressed files"
    git push -f deploy master
    echo "d14618518m0ura"

else

    echo "No deploy script for branch '$TRAVIS_BRANCH'"

fi