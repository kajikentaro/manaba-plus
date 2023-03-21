for s in `find $1`
do
    # Relative path
    f=${s#$1}

    # Destination path
    d=$2$f

    # If the source entry is directory, make it.
    [ -d "$s" ] && ( [ ! -d "$d" ] && mkdir "$d" ) && continue

    cp -u "$s" "$d"
done