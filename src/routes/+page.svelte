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
    <meta name="home" content="Finest City Pinball site" />
    </svelte:head>

    <section>
        <h1>
            Finest City Pinball
        </h1>
        <p style="text-align: center;">We rent pinball machines for any and all events in San Diego County</p>
        {#if browser}
        <Carousel
            bind:this={carousel}
            autoplay
            autoplayDuration={5000}
            >
            <div class="pinball_slide">
                <source srcset={deadpool} type="png" />
                <img src={deadpool} alt="deadpool" class="pinball_image" />
            </div>
            <div class="pinball_slide">
                <source srcset={star_wars} type="png" />
                <img src={star_wars} alt="star_wars" class="pinball_image" />
            </div>
            <div class="pinball_slide">
                <source srcset={full_house} type="jpeg" />
                <img src={full_house} alt="full_house" class="pinball_image" />
            </div>
        </Carousel>
        {/if}
    </section>

<style>
section {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 0.6;
}

.pinball_slide {
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
}
p {
    padding-bottom: 2em;
}

.pinball_image {
    height: 400px;
    display: flex;
    justify-content: center;
    flex-wrap: nowrap;
}

h1 {
    width: 100%;
}
</style>
