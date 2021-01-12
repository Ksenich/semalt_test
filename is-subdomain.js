// subdomain name = tld + main domain + subdomain
function isSubdomain(fullDomainName) {
    if (typeof fullDomainName !== 'string') {
        throw new Error('Domain Name is not a String');
    }

    const domainArray = fullDomainName.split(/\./g);
    const nonTLDDomains = removeGlobalSuffix(domainArray);

    if (nonTLDDomains.length == 0) {
        throw new Error('Domain Name does not contain main domain');
    }

    return nonTLDDomains.length > 1;
}

function removeGlobalSuffix(domainArray) {
    domainArray = domainArray.slice().reverse();
    const nonGlobalDomains = trimValidTLD(domainArray, getDomainSuffixDB());
    if (nonGlobalDomains === false) {
        throw new Error('Final domain is not a TLD')
    }
    return nonGlobalDomains.reverse();
}

function trimValidTLD(domains, db) {
    const domainInfo = db[domains[0]];
    if (!domainInfo) {
        return false;
    }
    const trimmedDomains = domains.slice(1);
    if (domainInfo.subdomains) {
        const nextLevelTrimmedDomains = trimValidTLD(trimmedDomains, domainInfo.subdomains);
        if (nextLevelTrimmedDomains === false) {
            return trimmedDomains;
        }
        return nextLevelTrimmedDomains;
    }
    return trimmedDomains;
}

function getDomainSuffixDB() {
    return db;
}

const db = {
    'ua': {
        subdomains: {
            'com': true,
        }
    },
    'uk': {
        subdomains: {
            'co': true,
            'parliament': {
                subdomains: {
                    'gov': true,
                }
            }
        }
    },
    'com': true,
}

//start tests

function runTests(debugLog) {
    function assert(func, args, expected, expectedError) {
        try {
            const value = func.apply(null, args);
            if (debugLog) {
                console.log(`'DEBUG. arg: ${args}, v: ${value},e: ${expected}'`);
            }
            if (expectedError) {
                console.error(args, `Exception ${expectedError} not thrown.`);
                return;
            }
            if (value !== expected) {
                console.error(args, `Value for ${args} does not match expected ${expected}.`);
            }
        } catch (e) {
            if (debugLog) {
                console.log(`'DEBUG. arg: ${args}, ex: ${e.message}, e: ${expectedError}'`);
            }
            if (!expectedError || expectedError !== e.message) {
                console.error(args, `Unexpected error thrown: "${e.message}, (${expectedError})".`);
            }
        }
    }

    assert(isSubdomain, ['test.ua'], false);
    assert(isSubdomain, ['test.com'], false);
    assert(isSubdomain, ['test.co'], true, 'Final domain is not a TLD');
    assert(isSubdomain, ['test.com.ua'], false);
    assert(isSubdomain, ['test.com.uk'], true);
    assert(isSubdomain, ['test.co.uk'], false);
    assert(isSubdomain, ['sub.test.ua'], true);
    assert(isSubdomain, ['sub.test.com.ua'], true);
    assert(isSubdomain, ['sub.test.com'], true);
    assert(isSubdomain, ['sub.parliament.uk'], false);
    assert(isSubdomain, ['sub.gov.parliament.uk'], false);
    assert(isSubdomain, ['actual-sub.sub.gov.parliament.uk'], true);
    assert(isSubdomain, ['sub.test.co'], null, 'Final domain is not a TLD');
    assert(isSubdomain, ['sub'], null, 'Final domain is not a TLD');
    assert(isSubdomain, [null], null, 'Domain Name is not a String');
}

runTests();