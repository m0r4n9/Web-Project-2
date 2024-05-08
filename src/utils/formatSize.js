const formatSize = (size) => {
    const formattedSize = size / 10;

    return formattedSize % 1 === 0 ? formattedSize.toString() : formattedSize.toFixed(1);
};

module.exports = formatSize;
