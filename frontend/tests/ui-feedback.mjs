/**
 * Feedback checks of tests/ui-checks.mjs: every error and every success is a toast, never a text under a field.
 * Each case submits a form of the demo (nothing is sent: the demo API answers in the browser) and reads the toasts.
 * @module tests/ui-feedback
 */

/**
 * Waits for a toast of a kind and returns its text ('' when none came).
 * @param {import('playwright-core').Page} page
 * @param {'error' | 'success' | 'info'} type
 * @returns {Promise<string>}
 */
const toastText = async (page, type) => {
    const toast = page.locator(`.toast-${type}:not(.is-leaving)`).last()
    return (await toast.waitFor({ timeout: 4000 }).then(() => toast.innerText()).catch(() => '')).trim()
}

/**
 * Runs the feedback cases.
 * @param {import('playwright-core').Page} page
 * @param {{ open: Function, login: Function, visibleFieldErrors: Function }} helpers
 * @returns {Promise<string[]>} Problems found.
 */
export async function feedbackChecks(page, { open, login, visibleFieldErrors }) {
    const problems = []
    const expect = (condition, message) => condition || problems.push(message)

    // Empty contact form: one error toast that sums up the fields, the first wrong field focused, no text under fields
    await open(page, '/contact/')
    await page.getByRole('button', { name: /Envoyer/ }).click()
    const contactError = await toastText(page, 'error')
    expect(/champs à corriger/.test(contactError), `contact vide : toast attendu « N champs à corriger », reçu « ${contactError} »`)
    expect(await page.locator('.toast-error').first().getAttribute('role') === 'alert', 'toast d’erreur sans role="alert"')
    // The toast shows at once, the focus moves to the field on the next frame
    await page.waitForTimeout(400)
    const focused = await page.evaluate(() => ({ ok: document.activeElement?.closest('[aria-invalid="true"]') !== null, what: `${document.activeElement?.tagName} ${document.activeElement?.className} ${document.activeElement?.getAttribute('name') ?? ''}` }))
    expect(focused.ok, `contact : le focus n’est pas sur le premier champ fautif (focus sur ${focused.what})`)
    expect(await page.locator('[aria-invalid="true"]').count() > 1, 'contact : champs fautifs sans aria-invalid')
    const contactTexts = await page.evaluate(visibleFieldErrors)
    expect(!contactTexts.length, `contact : texte d’erreur visible sous un champ (${contactTexts.join(', ')})`)

    // Contact form filled: success toast
    await page.getByLabel(/Nom/).first().fill('Camille Test')
    await page.getByLabel(/mail/i).first().fill('camille@exemple.fr')
    await page.getByLabel(/Sujet|Objet/).first().fill('Question de test').catch(() => {})
    await page.locator('textarea').first().fill('Bonjour, ceci est un message de test de la démo.')
    await page.getByRole('button', { name: /Envoyer/ }).click()
    const contactSuccess = await toastText(page, 'success')
    expect(contactSuccess.length > 0, 'contact rempli : pas de toast de succès')
    expect(await page.locator('.toast-success').first().getAttribute('role') === 'status', 'toast de succès sans role="status"')

    // Login with a wrong password: one error toast
    await open(page, '/connexion/')
    await page.getByLabel(/mail/i).first().fill('admin@elan-solidaire.example')
    await page.getByLabel(/Mot de passe/).first().fill('mauvais-mot-de-passe')
    await page.locator('form').getByRole('button', { name: /connecter/i }).click()
    expect((await toastText(page, 'error')).length > 0, 'connexion refusée : pas de toast d’erreur')

    // Product with sizes, added without a size: error toast; with a size: success toast
    await open(page, '/boutique/produit/t-shirt-elan-coton-bio/')
    const addButton = page.getByRole('button', { name: /Ajouter au panier/ })
    if (await page.locator('.size-picker').count()) {
        await addButton.click()
        expect((await toastText(page, 'error')).includes('taille'), 'produit sans taille : pas de toast « Choisissez une taille »')
        await page.locator('.size-option:not(.is-disabled)').first().click()
    }
    await addButton.click()
    expect((await toastText(page, 'success')).includes('panier'), 'ajout au panier : pas de toast de succès')

    // Toast: pause on hover (a success lasts 4.5 s), manual closing with its cross
    const message = await page.locator('.toast-success').last().innerText()
    const toast = page.locator('.toast', { hasText: message }).first()
    await toast.hover()
    await page.waitForTimeout(5500)
    expect(await toast.isVisible(), 'toast : il disparaît alors que la souris est dessus (pause attendue)')
    await toast.getByRole('button', { name: 'Fermer la notification' }).click()
    // The exit animation lasts --motion-exit (550 ms)
    await page.waitForTimeout(900)
    expect(await page.locator('.toast', { hasText: message }).count() === 0, 'toast : la croix ne le ferme pas')

    // Empty donation form (name and e-mail): one error toast, no text under the fields
    await open(page, '/don/')
    await page.getByRole('button', { name: /^Donner |Obtenir les coordonnées/ }).click()
    expect((await toastText(page, 'error')).length > 0, 'don vide : pas de toast d’erreur')
    expect(!(await page.evaluate(visibleFieldErrors)).length, 'don : texte d’erreur visible sous un champ')

    // Admin: saving the settings without values gives an error toast
    await login(page, 'admin')
    await open(page, '/admin/reglages/')
    await page.locator('form.admin-form').getByRole('button').last().click()
    expect((await toastText(page, 'error')).length > 0, 'admin, paramètres vides : pas de toast d’erreur')
    return problems
}
