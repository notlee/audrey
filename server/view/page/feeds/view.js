'use strict';

const Breadcrumb = require('../../partial/breadcrumb');
const EntryList = require('../../partial/list/entries');
const FeedErrorList = require('../../partial/feed-error-list');
const RelativeDate = require('../../partial/element/relative-date');
const {html} = require('@rowanmanning/app');
const layout = require('../../layout/main');
const Pagination = require('../../partial/pagination');

module.exports = function renderFeedsViewPage(context) {
	const {entries, entryPagination, feed, feedIsRead, nextPage, request, settings} = context;

	context.pageTitle = feed.displayTitle;

	// Add breadcrumbs
	context.breadcrumbs.push({
		label: 'Feeds',
		url: '/feeds'
	});

	// Populate main content
	const content = html`
		${showRefreshSuccess()}
		${showSubscriptionSuccess()}
		<${FeedErrorList} errors=${feed.errors} />
		<${Pagination.Description} date=${entryPagination.before} resetUrl=${feed.url} />
		<${EntryList} items=${entries}>
			<div class="notification notification--help" data-test="no-entries-message">
				<p>
					This feed doesn't have any entries. This might be because nothing has ${' '}
					been published in your configured retention period, you can change ${' '}
					retention times on the <a href="/settings">settings page</a>.
				</p>
			</div>
		<//>
		<${Pagination.Next} url=${nextPage}>
			View earlier entries
		<//>
	`;

	// Populate content sub-sections
	context.subSections = {

		// Content heading
		heading: html`
			<${Breadcrumb} items=${context.breadcrumbs} />
			<div class="content-head">
				<h1 class="content-head__title" data-test="feed-heading">${context.pageTitle}</h1>
				<nav class="content-head__navigation">
					<ul>
						<li>
							<a
								href=${feed.settingsUrl}
								class="content-head__link content-head__link--settings"
								title="Feed settings"
							>Feed settings</a>
						</li>
						<li>
							<form method="post" action=${feed.refreshUrl}>
								<input
									type="submit"
									value="Refresh feed"
									class="content-head__link content-head__link--refresh"
									title="Refresh feed"
								/>
							</form>
						</li>
						${entries.length ? html`
							<li>
								<form method="post" action=${feed.markUrl}>
									<input
										type="hidden"
										name="setStatus"
										value=${feedIsRead ? 'unread' : 'read'}
									/>
									<input
										type="submit"
										value="Mark all as ${feedIsRead ? 'unread' : 'read'}"
										class="
											content-head__link
											content-head__link--${feedIsRead ? 'unread' : 'read'}
										"
										title="Mark all entries in this feed as ${feedIsRead ? 'unread' : 'read'}"
									/>
								</form>
							</li>
						` : ''}
					</ul>
				</nav>
			</div>
		`,

		// Right-hand sidebar
		rhs: html`
			${showHelpText()}
			<div class="notification notification--info">
				<p>
					This feed was last refreshed ${' '}
					<${RelativeDate} date=${feed.syncedAt} />.
				</p>
				${feed.author ? html`<p>Authored by ${feed.author}.</p>` : ''}
			</div>
			<nav class="nav-list">
				<ul>
					<li>
						<a class="nav-list__link" href=${feed.htmlUrl}>View feed website</a>
					</li>
					<li>
						<a class="nav-list__link" href=${feed.xmlUrl}>View raw feed XML</a>
					</li>
				</ul>
			</nav>
		`
	};

	// Right-hand sidebar
	function showHelpText() {
		if (entries.length && settings.showHelpText) {
			return html`
				<div class="notification notification--help">
					<p>
						This page shows all of the entries for the feed
						"${feed.displayTitle}". From here you can read,
						refresh, and configure the feed.
					</p>
				</div>
			`;
		}
		return '';
	}

	function showSubscriptionSuccess() {
		const flashMessage = request.flash('subscribed');
		if (flashMessage && flashMessage.length) {
			return html`
				<div class="notification notification--success" data-test="subscribe-success">
					<p>
						You subscribed to "${feed.displayTitle}"! ${' '}
						You can view entries for this feed on this page. ${' '}
						To view entries for all feeds, head to ${' '}
						<a href="/">the Unread page</a>.
					</p>
				</div>
			`;
		}
		return '';
	}

	function showRefreshSuccess() {
		const flashMessage = request.flash('refreshed');
		if (flashMessage && flashMessage.length) {
			return html`
				<div class="notification notification--success" data-test="refresh-success">
					<p>
						This feed has been refreshed.
					</p>
				</div>
			`;
		}
		return '';
	}

	// Wrap the content in a layout and return to render
	return layout(context, content);
};
