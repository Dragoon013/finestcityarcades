<script>
import Carousel from 'svelte-carousel'
import {
    browser
} from '$app/environment';
import star_wars from '$lib/images/star_wars_flyer.png';
import deadpool from '$lib/images/dp_pro_flyer.png';
import full_house from '$lib/images/full_house_pinball.jpeg';

let carousel; // for calling methods of the carousel instance
</script>

<svelte:head>
    <title>Home</title>
    <meta name="home" content="The Friendly Flipper site" />
    </svelte:head>

    <section>
        <h1>
            Welcome to the Friendly Flipper
        </h1>
        {#if browser}
        <Carousel
            bind:this={carousel}
            autoplay
            >
            <div class="pinball_slide">
                <source srcset={deadpool} type="png" />
                <img src={deadpool} alt="deadpool" class="pinball_image" />
            </div>
            <div>
                <source srcset={star_wars} type="png" />
                <img src={star_wars} alt="star_wars" class="pinball_image" />
            </div>
            <div>
                <source srcset={full_house} type="jpeg" />
                <img src={full_house} alt="full_house" class="pinball_image" />
            </div>
        </Carousel>
        {/if}
    </section>

<style>
section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
}

.pinball_slide {
    position: relative;
    padding-top: 60%;
    width: 100%;
    user-select: none;
    overflow: hidden;
}

.pinball_image {
    background-size: cover;
    background-position: center;
	text-align: center;
    height: 500px
}

h1 {
    width: 100%;
}
</style>
