{
  // method to submit the form data for new post using AJAX

  let createPost = function () {
    let newPostForm = $("#new-post-form");

    newPostForm.submit(function (e) {
      e.preventDefault();
      var data = new FormData(newPostForm[0]);

      $.ajax({
        type: "POST",
        url: "/posts/create",
        enctype: "multipart/form-data",
        data: data,
        processData: false, // Important!
        contentType: false,
        cache: false,
        timeout: 600000,
        //data: new FormData(newPostForm),
        success: function (data) {
          let newPost = newPostDom(data.data.post);
          $("#posts-list-container").prepend(newPost);
          $("#text_area").val("");
          //#posts-list-container>ul

          deletePost($(" .delete-post-button", newPost));
          //this means newpost object ke andar jo delete-post-button class

          // call the create comment class
          new PostComments(data.data.post._id);

          // CHANGE :: enable the functionality of the toggle like button on the new post
          new ToggleLike($(" .toggle-like-button", newPost));

          new Noty({
            theme: "relax",
            text: "Post published!",
            type: "success",
            layout: "topRight",
            timeout: 1500,
          }).show();
        },
        error: function (error) {
          console.log(error.responseText);
        },
      });
    });
  };

  // method to create a post in DOM
  let newPostDom = function (post) {
    return $(`
    <div class="post-wrapper" id="post-${post._id}">
  <div class="post-header">
    <div class="post-avatar">
      <img
        src="${post.user.avatar}"
        alt="user-pic"
      />

      <div>
        <span class="post-author"> ${post.user.name}</span>
        <span class="post-time">a sec ago</span>
      </div>
    </div>

    <div class="post-content">${post.content}</div>
    ${post.avatar ? `<img src=${post.avatar} width="65%" />` : ""}
    
    <div class="post-actions">
      
      <small class="post-like">
        <img
          src="../uploads/images/like.png"
          alt="like-icon"
        />
        
        <a
          class="toggle-like-button"
          data-likes=${post.likes.length}
          href="/likes/toggle/?id=${post._id}&type=Post"
        >
        ${post.likes.length} Likes
        </a>
        
      </small>
      <div class="post-comments-icon">
        <img
          src="../uploads/images/comment.png"
          alt="comments-icon"
        />
        <span> ${post.comments.length}</span>
      </div>
      
      <a class="delete-post-button" href="/posts/destroy/${post._id}"
        ><img
          src="../uploads/images/delete.png"
          alt="delete-icon"
      /></a>
      
    </div>
    <div class="post-comment-box">
     
      <form
        id="post-${post._id}-comments-form"
        action="/comments/create"
        method="POST"
      >
        <input
          type="text"
          id="text-area-comment"
          name="content"
          placeholder="Type Here to add comment..."
          required
        />
        <input type="hidden" name="post" value="${post._id}" />

        <input type="submit" value="Add Comment" />
      </form>
    </div>
    <div class="post-comments-list" id="post-comments-${post._id}">
     
    </div>
  </div>
</div>

    `);
  };

  // method to delete a post from DOM
  let deletePost = function (deleteLink) {
    $(deleteLink).click(function (e) {
      e.preventDefault();

      $.ajax({
        type: "get",
        url: $(deleteLink).prop("href"),
        success: function (data) {
          $(`#post-${data.data.post_id}`).remove();
          new Noty({
            theme: "relax",
            text: "Post Deleted",
            type: "success",
            layout: "topRight",
            timeout: 1500,
          }).show();
        },
        error: function (error) {
          console.log(error.responseText);
        },
      });
    });
  };

  // loop over all the existing posts on the page (when the window loads for the first time) and call the delete post method on delete link of each, also add AJAX (using the class we've created) to the delete button of each
  let convertPostsToAjax = function () {
    $("#posts-list-container>div").each(function () {
      let self = $(this);

      let deleteButton = $(" .delete-post-button", self);
      deletePost(deleteButton);

      // get the post's id by splitting the id attribute
      let postId = self.prop("id").split("-")[1];
      new PostComments(postId);
    });
  };

  createPost();
  convertPostsToAjax();
}
