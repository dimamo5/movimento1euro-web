#!/bin/bash

# print outputs and exit on first failure
set -xe

if [ $TRAVIS_BRANCH == "master" ] ; then

    git checkout master
    git remote add deploy ssh://root@ldso.diogomoura.me/var/repo/runtime/ldso.git
    rm -f .gitignore
    git add .
    git status # debug
    git commit -m "Deploy compressed files"
    git push -f deploy master
    git push deploy master

else

    echo "No deploy script for branch '$TRAVIS_BRANCH'"

fi