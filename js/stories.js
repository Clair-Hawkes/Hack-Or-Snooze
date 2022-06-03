"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <span class="star">
        <i class="far fa-star"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/**When users submit form, collect form data.
 * Call .addStory().
 * Add new story to page */

async function submitNewStory(evt) {
  evt.preventDefault();
  console.log('submitNewStory');

  const storyAuthor = $('#create-author').val();
  const storyTitle = $('#create-title').val();
  const storyURL = $('#create-url').val();

  const storyDesriptionsAndValues =
    { title: storyTitle, author: storyAuthor, url: storyURL };

  const createdStory =
    await storyList.addStory(currentUser, storyDesriptionsAndValues);
  console.log(createdStory);

  $('#submit-form').hide();

  const $story = generateStoryMarkup(createdStory);

  $allStoriesList.prepend($story);
}

$('#submit-form').on('submit', submitNewStory);



/**addFavorites will post a story to a users favorites via API
 * Or will DELETE a story from users favorites via API
 * Will update star symbol of story id post.
 */
async function addFavorite(evt) {
  console.log("evt", evt);

  const storyId = $(evt.target).closest('li').attr('id');
  console.log('storyId', storyId);

  if ($(evt.target).hasClass("far fa-star")) {
    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
      method: "POST",
      data: { token: currentUser.loginToken }
    });
    console.log(response);

    $(evt.target).removeClass("far fa-star");
    $(evt.target).addClass("fas fa-star");

  } else if ($(evt.target).hasClass("fas fa-star")) {
    _deleteFavorite();
  }

  /**deleteFavorite will delete a story from a users favorites via API.
 * Will update star symbol of story id post.
 */
  async function _deleteFavorite() {
    console.log('deleteFavorite');

    const response = await axios({
      url: `${BASE_URL}/users/${currentUser.username}/favorites/${storyId}`,
      method: "DELETE",
      data: { token: currentUser.loginToken }
    });
    console.log(response);

    $(evt.target).removeClass("fas fa-star");
    $(evt.target).addClass("far fa-star");
  }
}


$('#all-stories-list').on('click', addFavorite);

// $('#all-stories-list').on('click', currentUser.addFavorites.bind(currentUser));


