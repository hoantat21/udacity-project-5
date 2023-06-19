import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const bucketName = process.env.ATTACHMENT_S3_BUCKET

// // TODO: Implement the fileStogare logic

const s3: AWS.S3 = new XAWS.S3({
    signatureVersion: 'v4'
})


export function getUploadUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: imageId,
        Expires: 300
    })
}

export function getDownloadUrl(imageId: string): string {
    return s3.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: imageId
    })
}

