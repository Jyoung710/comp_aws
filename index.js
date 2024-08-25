const express = require('express');
const app = express();
const path = require('path');
const fsPromises = require('fs').promises
const PORT = process.env.PORT || 3000;

const Blog = {
    posts: require(path.join(__dirname, 'models', 'BlogPost.json')),
    setPost: function (data) { this.posts = data },
}

//post요청의 body를 parsing할 수 있게하는 미들웨어
app.use(express.json());

app.get('/blog', (req, res) => res.status(200).json({ msg: Blog.posts }) );
app.post('/blog', async (req, res) => {
    const { author, title, content } = req.body; //구조 분해 할당(deconstructuring assignment)을 통해 author, title, content 필드를 추출
    if (author == null || title == null || content == null)
        return res.status(400).json({ msg: '작성자, 제목, 본문 필드가 모두 필요합니다.' });
    const newPost = { "author": author, "title": title, "content": content };
    Blog.setPost([...Blog.posts, newPost]); //spread 연산자를 통해 기존 블로그 posts와 방금 만든 newPost를 모은다.
    try { //파일I/O 등 작업을 할때는 try..catch문 등으로 예외처리 필수
        await fsPromises.writeFile(
            path.join(__dirname, 'models', 'BlogPost.json'),
            JSON.stringify(Blog.posts)
        );
        res.status(201).json({ 'msg': "새 게사글이 생성되었습니다. "});
    } catch {
        res.status(500).json({ 'msg': "알 수 없는 오류 발생 "});
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));