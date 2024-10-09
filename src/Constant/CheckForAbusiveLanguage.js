const checkForAbusiveLanguage = (content) => {
    const abusiveWords = ['fuck', 'shit', 'bitch', 'asshole', 'damn', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy', 'dick', 'motherfucker', 'fucker', 'asshole', 'bastard', 'crap', 'piss', 'cock', 'pussy']
    const words = content.split(' ');
    const hasAbusiveLanguage = words.some(word => abusiveWords.includes(word));
    return hasAbusiveLanguage;
}
export { checkForAbusiveLanguage };
//in future we can use AI to check for abusive language or can use google API to check for abusive language or can make own ML model to check for abusive language
