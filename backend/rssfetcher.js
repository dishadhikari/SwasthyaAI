const Parser=require("rss-parser");
const parser=new Parser();
const feeds=["https://www.self.com/feed/rss", "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml"];

async function fetcharticles()
{
    let articles=[];
    for(const feedurl of feeds){
        try{
        const feed=await parser.parseURL(feedurl);
        feed.items.forEach((item)=>{
            articles.push({
                title:item.title,
                url:item.link,
                published_at:item.pubDate,
                image_url:item.enclosure?.url||null,
                content:
                    item.contentSnippet||
                    item.content||
                    item.summary||
                    ""
                });
            });
        }
        catch(err){
            console.error("RSS FAILED:", feedurl, err.message);
            continue; // IMPORTANT: don't crash whole cron
        }
    }
    return articles;
}
module.exports=fetcharticles;