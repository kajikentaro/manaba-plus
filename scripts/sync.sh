# Copy and update files.
# Usage: sh /path/to/sync.sh 'src-dir' 'dst-dir'

for s in `find $1`
do
    # Relative path
    f=${s#$1}

    # Destination path
    d=$2$f

    # If the source entry is directory, make it.
    [ -d "$s" ] && mkdir -p "$d" && continue

    # cp -u "$s" "$d"
    if [ "$s" -nt "$d" ]; then
        cp "$s" "$d"
    fi
done