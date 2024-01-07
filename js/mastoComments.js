import MastoClient from "./masto/MastoClient.js";

const client = new MastoClient("https://chitter.xyz", "110793467193697541");
const commentDiv = document.getElementById("fediComments");
const rootPostId = document.getElementById('fediComments').dataset.postid;

const context = await client.fetchStatusContext(rootPostId);

if(!context?.descendants || context.descendants.length == 0){
    const noneYet = document.createElement('span');
    noneYet.className = "noneYet";
    noneYet.textContent = "(None yet!)";
    commentDiv.appendChild(noneYet);
} else {
    for(const post of context.descendants){
        const account = post.account;

        const accountName = document.createElement("strong");
        accountName.textContent = account.username;

        const avatar = document.createElement('img');
        avatar.src = account.avatar;
        avatar.width = 100;

        const accountLink = document.createElement('a');
        accountLink.href = account.url;
        accountLink.appendChild(avatar);
        accountLink.appendChild(accountName);

        const commentText = document.createElement('span');
        commentText.innerHTML = post.content;

        const replyLink = document.createElement('a');
        replyLink.href = post.url;
        replyLink.textContent = "Reply";
        replyLink.className = "replyLink";
        replyLink.target = "_blank";

        const comment = document.createElement('div');
        comment.appendChild(accountLink);
        comment.appendChild(commentText);
        comment.appendChild(replyLink);

        commentDiv.appendChild(comment);
    }
}