#!/bin/bash

channel=$1
url=$2

curl -s -f -J -L -o "$channel" --output-dir output/tmp  --connect-timeout 1 "$url"

if [ $? -ne 0 ]; then
  echo "COULDNT_FETCH_FILE"
  exit 0
fi

case $(file --mime-type -b "output/tmp/$channel") in
  image/png)
    echo "$channel.png"
    mv "output/tmp/$channel" "output/$channel.png" ;;
  image/jpeg)
    echo "$channel.jpg"
    mv "output/tmp/$channel" "output/$channel.jpg" ;;
  image/vnd.microsoft.icon)
    echo "$channel.ico"
    mv "output/tmp/$channel" "output/$channel.ico" ;;
  image/gif)
    echo "$channel.gif"
    mv "output/tmp/$channel" "output/$channel.gif" ;;
  image/svg+xml)
    echo "$channel.svg"
    mv "output/tmp/$channel" "output/$channel.svg" ;;
  *)
    echo ">>>>>>>>>>> NEW FILE TYPE $(file --mime-type -b "output/tmp/$channel") <<<<<<<<<<<<" ;;
esac

