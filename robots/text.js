const algorithmia = require('algorithmia')
const algorithmiaApiKey= require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection=require('sbd')
async function robot(content){
    await fetchContntFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    
    async function fetchContntFromWikipedia(content){
        const algorithmiaAuthenticated=algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm=algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2")
        const wikipediaResponse= await wikipediaAlgorithm.pipe(content.searchTerm)
        const wikipediaContent=wikipediaResponse.get()
        content.sourceContentOriginal = wikipediaContent.content
    }
    function sanitizeContent(content){
        const withoutBlankLinesAndMarkdown=removeBlankLinesAndMarkdown(content.sourceContentOriginal)
        const withoutDatesInParenthesis=removeDatesInParentheses(withoutBlankLinesAndMarkdown)
        
        content.sourceContentSanitazed=withoutDatesInParenthesis
        
        function removeBlankLinesAndMarkdown(text){
            const allLines = text.split('\n')
            const withoutBlankLinesAndMarkdown = allLines.filter((line)=>{
                if(line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkdown.join(' ')
        }

        function removeDatesInParentheses(text){
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
        
    }
    function breakContentIntoSentences(content){
        content.sentences=[]
        const sentences=sentenceBoundaryDetection.sentences(content.sourceContentSanitazed)
        sentences.forEach(sentence => {
            content.sentences.push({
              text: sentence,
              keywords: [],
              images: []
            });
          });
        
    }

    //console.log('recebi com sucesso o content: '+ content.searchTerm+'');
}
module.exports=robot