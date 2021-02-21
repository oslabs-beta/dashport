const parseCode = (encodedCode: string): string => {
    
  const decodedString: { [name: string] : string } = {
    "%24": "$",
    "%26": "&",
    "%2B": "+",
    "%2C": ",",
    "%2F": "/",
    "%3A": ":",
    "%3B": ";",
    "%3D": "=",
    "%3F": "?",
    "%40": "@"
  }

  const toReplaceArray: string[] = Object.keys(decodedString);
  // console.log('encoded code (fb 172)', encodedCode);
  for(let i = 0; i < toReplaceArray.length; i++) {
    while (encodedCode.includes(toReplaceArray[i])) {
      encodedCode = encodedCode.replace(toReplaceArray[i], decodedString[toReplaceArray[i]]);
    }
  }
  return encodedCode; 
}

let arr = ['access_token=3bc3f97d001d5fd0b87c3c330bcca3637fcbdb48',
  'scope=read%3Auser', 'token_type=bearer']; 

arr = parseCode(arr); 