const axios = require('axios')
const crypto = require('crypto')
const config = require('config')

// TODO: move these constant to config file
const accessKey = ''
const secretKey = ''
const url = 'https://api.xt.com'

const httpClient = axios.create()
httpClient.defaults.timeout = 2500

/**
 * Return latest price of a given pair.
 *
 * @param {string} pair The given pair ex. 'btc_usdt'
 * @return {number} latest price of a given pair ex. 61000.25 
 */
const getLatestPrice = async(pair) => {
    /* 
        getLatestPrice return latest price of a given pair
        params:
    */ 
    try{
        let response = await httpClient.get(`${url}/data/api/v1/getTicker?market=${pair}`)
        .catch(err => {
            throw new Error(`${err.response.status}: ${err.response.statusText}`)
        })
        return response.data.price
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Return trading (spot) account assets
 *
 * @return {dict} ex. 
 * { 
 *  usdt: { available: '150', freeze: '0' },
 *  btc: { available: '0.001', freeze: '0' } 
 * } 
 */
const getBalance = async() => {
    let params = {
        'accessKey': accessKey,
        'nonce': Date.now()
    }
    let signature = _getSignature(params, secretKey)
    params['signature'] = signature
    try {
        let response = await httpClient.get(`${url}/trade/api/v1/getBalance`, {params: params})
        .catch(err => {
            throw new Error(`${err.response.status}: ${err.response.statusText}`)
        })
        return response.data.data
    } catch (err) {
        console.log(err.message)
    }
}

/**
 * Return signature
 * 
 * @param {string} params a query params
 * @param {string} secretKey a key to sign the params
 * @return {string} signature from HmacSHA256 algorithm
 */
const _getSignature = (params, secretKey) => {
    let queryString = Object.keys(params).map(key => key + '=' + params[key]).join('&')
    let signature = crypto.createHmac('sha256', secretKey, {'encoding': 'utf8'})
    .update(queryString)
    .digest('hex')
    return signature
}

module.exports = { getLatestPrice, getBalance }
