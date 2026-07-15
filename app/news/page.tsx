"use client";

import {useEffect,useState} from "react";


interface Article{
  title:string;
  content:string;
  summary:string;
  url:string;
  image_url?:string;
  category:string;
  points:string[];
}


export default function News(){

    const [articles,setArticles]=useState<Article[]>([]);
    const [loading,setLoading]=useState(true);



    useEffect(()=>{

        async function getNews(){

            const res = await fetch(
                "http://localhost:5000/news"
            );

            const data = await res.json();
            console.log("API Response:", data);
            console.log("Is Array:", Array.isArray(data));
            setArticles(data);
            setLoading(false);
        }


        getNews();

    },[]);



    if(loading)
    {
        return <h1>Loading news...</h1>
    }



    return (
      <main>
  
          <h1>🏋️ Fitness News</h1>
  
          <div>
  
          {
              articles.map((article,index)=>(
  
                  <div key={index}
                  style={{
                      border:"1px solid #ddd",
                      padding:"20px",
                      margin:"20px 0",
                      borderRadius:"10px"
                  }}>
  
  
                      <h2>
                          {article.title}
                      </h2>
  
  
                      <p>
                          {article.summary}
                      </p>
                      5-minute AI summary!
                      <ul>
                      {
                          article.points?.map((point,index)=>(
                              <li key={index}>
                                  {point}
                              </li>
                          ))
                      }
                      </ul>
  
                  
  
                      <br/><br/>
  
  
                      <a
                      href={article.url}
                      target="_blank"
                      >
                          View Full Article →
                      </a>
  
  
                  </div>
  
              ))
          }
  
          </div>
  
      </main>
  )
}