//
function randomWords(min, max)
{
    let len = Math.min(1 * (min || 25), Math.floor(Math.random() * (max || 100)));
    let words = '';
    for (let i = 0; i < len; i++) {
        words += (' ' + randomWords.data[Math.floor(Math.random() * randomWords.data.length)]);
    }
    return words.trim();
}
randomWords.data = ["It", "takes", "several", "ingredients", "to", "create", "a", "delicious", "blog.", "It", "has", "been", "exactly", "3", "years", "since", "I", "wrote", "my", "first", "blog", "series", "entitled", "“Flavorful", "Tuscany”,", "but", "starting", "it", "was", "definitely", "not", "easy.", "Back", "then,", "I", "didn’t", "know", "much", "about", "blogging,", "let", "alone", "think", "that", "one", "day", "it", "could", "become", "my", "full-time", "job.", "Even", "though", "I", "had", "many", "recipes", "and", "food-related", "stories", "to", "tell,", "it", "never", "crossed", "my", "mind", "that", "I", "could", "be", "sharing", "them", "with", "the", "whole", "world"];

/* users */
export const users = [
    {
        tel: '+84937984900',
        first_name: 'Phi',
        last_name: 'Khanh'
    },
    {
        tel: '+84777727873',
        first_name: 'Hồng',
        last_name: 'Vi'
    },
    {
        tel: '+84789813407',
        first_name: 'Nguyệt',
        last_name: 'Nhạn'
    },
    {
        tel: '+84000000001',
        first_name: 'FN_001',
        last_name: 'LN_001'
    },
    {
        tel: '+84000000002',
        first_name: 'FN_002',
        last_name: 'LN_002'
    },
    {
        tel: '+84000000003',
        first_name: 'FN_003',
        last_name: 'LN_003'
    },
    {
        tel: '+84000000004',
        first_name: 'FN_004',
        last_name: 'LN_004'
    },
    {
        tel: '+84000000005',
        first_name: 'FN_005',
        last_name: 'LN_005'
    }
];
/* .end#users */

/* msgs */
export const msgs = [];
for (let i = 0; i < 512; i++) {
    let now = new Date();
    now.setDate(now.getDate() - Math.round(Math.random() * 365));
    msgs.push({
        id: (new Date().toISOString()) + Math.random().toString(),
        tel: users[Math.floor(Math.random() * users.length)]['tel'],
        date: now,
        content: randomWords(),
        favorite: false
    });
}
/* end#msgs */