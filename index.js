const { BlobServiceClient } = require('@azure/storage-blob')
const uuidv1 = require('uuid/v1')

require('dotenv').config()

const CONN_STR = process.env.CONN_STR

async function main () {
  // to create a container
  console.log('Azure Blob storage V12 - JS quickstart sample')
  const blobServiceClient = await BlobServiceClient.fromConnectionString(
    CONN_STR
  )

  // to create a unique name ofr the container
  const containerName = 'quickstart' + uuidv1()

  console.log('\nCreating the container...')
  console.log('\t', containerName)

  // to get a reference to a container
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  )

  // to create the container
  const createContainerResponse = await containerClient.create()
  console.log(
    'Container was created succeessfully. requestId: ',
    createContainerResponse.requestId
  )

  // to upload blobs to a container
  const blobName = 'quickstart' + uuidv1() + '.txt'
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)
  console.log('\nUploading to Azure storage as blob:\n\t', blobName)

  // to upload data to the blob
  const data = 'Hello, World!'
  const uploadBlobResponse = await blockBlobClient.upload(data, data.length)
  console.log(
    'Blob was uploaded successfully. requestId: ',
    uploadBlobResponse.requestId
  )

  // to list the blobs in a container
  console.log('\nlisting blobs...')
  for await (const blob of containerClient.listBlobsFlat()) {
    console.log('\t', blob.name)
  }

  // to download blobs
  // Get blob content from position 0 to the end
  // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
  // In browsers, get downloaded data by accessing downloadBlockBlobResponse.blobBody
  const downloadBlockBlobResponse = await blockBlobClient.download(0)
  console.log('\nDownloaded blob content...')
  console.log(
    '\t',
    await streamToString(downloadBlockBlobResponse.readableStreamBody)
  )

  // Delete container
  console.log('\nDeleting container...')

  const deleteContainerResponse = await containerClient.delete()
  console.log(
    'Container was deleted successfully. requestId: ',
    deleteContainerResponse.requestId
  )
}

main()
  .then(() => console.log('Done'))
  .catch(ex => console.log(ex.message))

// A helper function used to read a Node.js readable stream into a string
async function streamToString (readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = []
    readableStream.on('data', data => {
      chunks.push(data.toString())
    })
    readableStream.on('end', () => {
      resolve(chunks.join(''))
    })
    readableStream.on('error', reject)
  })
}
