Metley

A Spotify Medley for your Metro Journey.

Metley is an app made to ease the chronic pain of a daily DC Metro commute, distracting the user with the siren song of a smooth, seamless Spotify playlist. After signing in through an OAuth 2.0 Authentication process, the user is directed to a page to plan their metro ride. On the “Plan Your Journey” page, the app populates three selection menus with metro station and genre choices pulled from DC Metro’s and Spotify’s respective APIs.  The user selects their current and destination stations, followed by the mood they would like to be the background music of their commute. Once the submit button is pressed, the app calculates the total time of the user’s journey using data from the Metro API and then generates a Spotify playlist, posting it to the user’s Spotify account. The site redirects to a page that lists the songs in the playlist and a new tab opens the playlist on the Spotify web player. Each song is selected by gathering data from endpoints of the individual tracks, and filtering them in or out by matching it to a randomly chosen musical key, giving every song on the playlist has the same key which allows the playlist to transition more naturally from song-to-song. The songs are ordered by energy level, again found on the individual track’s endpoint, with the lowest-energy-level song at the beginning and highest at the end. With the matching keys and gradual build of energy, the playlist has a cohesive sound. The user also has an link to view journey details, like trip length.

Sign in
https://raw.githubusercontent.com/ianmcdermott/metley/master/Metley%20Screenshots/Home.png

Plan Your Journey
https://raw.githubusercontent.com/ianmcdermott/metley/master/Metley%20Screenshots/Plan.png

Playlist screen
https://raw.githubusercontent.com/ianmcdermott/metley/30d13b6072290e4bd2dca9e15ac00051b6cc9961/Metley%20Screenshots/Playlist.png

Spotify Web Player
https://raw.githubusercontent.com/ianmcdermott/metley/30d13b6072290e4bd2dca9e15ac00051b6cc9961/Metley%20Screenshots/Spotify%20Web%20Player.png

Live Site You can access Metley - ianmcdermott.github.io/metley/public/

Made with HTML, CSS, JavaScript, jQuery and a little Node.js
Site Responsiveness using Bootstrap
