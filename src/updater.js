const { dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
//const log = require('electron-log')
const i18n = require('hydra-i18n')

autoUpdater.autoDownload = false

let _silent = false

//autoUpdater.logger = log
//autoUpdater.logger.transports.file.level = 'info'

/**
 * Call this to manually trigger the update flow, including the dialog box.
 */
exports.checkForUpdates = async (silent) => {
  // try to get info about a potential update
  // try {
  //   let updateInfo = await autoUpdater.getUpdateInfoAndProvider()
  //   console.log(updateInfo)
  // } catch (err) {
  //   // many things can trigger this catch... github could be down, the new release may be missing a file...
  //   console.warn('Could not find update, maybe GitHub is down or a file is missing from the new release.')
  //   console.log(err)
  //   return false
  // }

  if (silent !== undefined) {
    _silent = silent
  }

  // ask the user to download the update
  try {
    await autoUpdater.checkForUpdates()
  } catch (err) {
    // having an incomplete release can trigger this catch (missing .dmg, .zip, etc)
    console.log(err)
    onUpdateNotAvailable('checkForUpdates() threw an error.')
  }
}

/**
 * Update available.
 */
autoUpdater.on('update-available', async (info) => {
  console.log('An update was found:')
  console.log(info)

  let answer = await dialog.showMessageBox({
    type: 'info',
    title: i18n.string('updater.ask-to-update.title'),
    message: i18n.string('updater.ask-to-update.msg'),
    buttons: [i18n.string('updater.ask-to-update.btn.yes'), i18n.string('updater.ask-to-update.btn.no')],
    defaultId: 0,
    cancelId: 1,
  })

  if (answer.response === 0) {
    console.log('Update accepted by user')
    autoUpdater.downloadUpdate()
  } else {
    console.log('Update postponed by user')
  }
})

/**
 * No update available.
 */
autoUpdater.on('update-not-available', onUpdateNotAvailable)
async function onUpdateNotAvailable(info) {
  console.log('No update was found:')
  console.log(info)

  if (!_silent) {
    dialog.showMessageBox({
      type: 'info',
      title: i18n.string('updater.no-updates.title'),
      message: i18n.string('updater.no-updates.message'),
      buttons: [],
    })
  }
}

/**
 * On error.
 */
autoUpdater.on('error', (err) => {
  console.warn(err)
})

/**
 * Download progress.
 */
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond

  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';

  console.log(log_message)
})

/**
 * Download done.
 */
autoUpdater.on('update-downloaded', (info) => {
  autoUpdater.quitAndInstall()
})