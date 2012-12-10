
node-huffman-compression
========================

This library can be used to efficiently compress small strings with a fixed alphabet. For example a column in a database containing URL's.

The library contains functions to create a dictionary and use it to compress and uncompress data.

API
---

```
dictionary = new huffman.Dictionary(data)
```
Create a new dictionary and train it with the specified data.

```
dictionary.fromString(data)
```
Initialize the dictionary from the specified data. This data should be the output from a previous `dictionary.toString()`.

```
dictionary.toString()
```
Return a string containing all the data for the dictionary. This can be stored and later used with `dictionary.fromString()`.
`dictionary.finish()` must be called before calling this function.

```
dictionary.train(data)
```
Train the dictionary with the specified data.

```
dictionary.finish()
```
Finish training the dictionary. After this the dictionary can be used to inflate or deflate data.

```
huffman.compress(dictionary, data)
```
Compress data using the specified dictionary. `dictionary` should be a finished dictionary.
This function will return a buffer containing the compressed binary data.

```
huffman.decompress(dictionary, data)
```
Decompress data using the specified dictionary. `dictionary` should be a finished dictionary.
`data` should be a buffer containing the binary compressed data.
This function will return an array containing the uncompressed data. Use `.join('')` to convert this to a string, or `new Buffer(returnValue)` to convert this to a buffer.

