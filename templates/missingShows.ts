export const source = `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
	</head>
	<body
		style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px"
	>
		<div
			class="header"
			style="background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin-bottom: 20px"
		>
			<h1 style="margin: 0">Missing Episodes Update</h1>
		</div>
		<div class="content" style="background-color: #f9f9f9; padding: 20px; border-radius: 8px">
			<p>Hello,</p>
			<p>We've detected some missing episodes in your TV show collection. Here are the details:</p>

			{{#each shows}}
			<div
				class="show-card"
				style="background-color: white; border-radius: 8px; padding: 15px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); display: flex; align-items: flex-start; gap: 15px"
			>
				<div class="poster-container" style="flex-shrink: 0; width: 100px">
					<img
						src="https://image.tmdb.org/t/p/original{{poster}}"
						alt="{{name}} poster"
						class="poster"
						style="width: 100px; height: 150px; object-fit: cover; border-radius: 4px"
					>
				</div>
				<div class="show-info" style="flex-grow: 1">
					<div
						class="show-title"
						style="color: #2c3e50; font-size: 18px; font-weight: bold; margin-bottom: 10px; margin-left: 12px"
					>
						{{name}}
					</div>
					<ul class="episode-list" style="list-style-type: none; padding-left: 0; margin: 0">
						{{#each episodes}}
						<li class="episode-item" style="padding: 8px 0; border-bottom: none; padding-bottom: 0">
							Episode {{season}}x{{episode}}: {{name}}
						</li>
						{{/each}}
					</ul>
				</div>
			</div>
			{{/each}}

			<p class="footer-text" style="color: #666; margin-top: 20px">
				These episodes are currently missing from your filesystem
			</p>

			<p>Best regards,<br>Your TV Show Tracker</p>
		</div>
	</body>
</html>

`;
