import qz from 'qz-tray'

qz.security.setCertificatePromise((resolve) => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/qz-certificate`)
        .then(r => r.text())
        .then(resolve)
})

qz.security.setSignatureAlgorithm('SHA512')
qz.security.setSignaturePromise((toSign) => {
    return (resolve, reject) => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/qz-sign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: toSign })
        })
            .then(r => r.text())
            .then(resolve)
            .catch(reject)
    }
})

async function connectQZ() {
    if (!qz.websocket.isActive()) {
        try {
            await qz.websocket.connect()
            console.log('QZ Tray connesso ✅')
        } catch (err) {
            alert('⚠️ QZ Tray non è aperto!\nAvvialo dalla taskbar e riprova.')
            throw err
        }
    }
}

async function stampaComanda(order) {
    try {
        await connectQZ()

        const printer = await qz.printers.find('POS-58-Series')
        const config = qz.configs.create(printer)

        const data = [
            '\x1B\x40',                          // init
            '\x1B\x61\x01',                      // centra
            '\x1B\x21\x30',                      // font grande
            '*** CUCINA ***\n',
            '\x1B\x21\x00',                      // font normale
            '\x1B\x61\x00',                      // sinistra
            '--------------------------------\n',
            `\x1B\x45\x01Tavolo: ${order.table}\x1B\x45\x00\n`,
            `Ordine #${order.number_order}\n`,
            `Ora: ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}\n`,
            '--------------------------------\n\n',

            // Raggruppa per scope
            ...groupByScope(order.products),

            '--------------------------------\n',
            '\n\n\n',
            '\x1D\x56\x42\x00',                 // taglia carta
        ]

        await qz.print(config, data)
        console.log('Comanda inviata ✅')

    } catch (err) {
        console.error('Errore stampa:', err)
    }
}

function groupByScope(products) {
    const lines = []

    // Raggruppa per scope
    const grouped = products.reduce((acc, p) => {
        const scope = p.pivot.scope ?? 1
        if (!acc[scope]) acc[scope] = []
        acc[scope].push(p)
        return acc
    }, {})

    Object.keys(grouped).sort().forEach(scope => {
        lines.push(`\x1B\x45\x01-- PORTATA ${scope} --\x1B\x45\x00\n`)

        grouped[scope].forEach(p => {
            // Salta le bevande
            if (p.category_id === 5) return

            lines.push('\x1B\x21\x10')  // font grande
            lines.push(`${p.pivot.qty}x ${p.name}\n`)
            lines.push('\x1B\x21\x00')  // font normale

            if (p.pivot.note) {
                lines.push(`  !! ${p.pivot.note.toUpperCase()}\n`)
            }
        })

        lines.push('\n')
    })

    return lines
}

async function stampaPreconto(order) {
    try {
        await connectQZ()

        const printer = await qz.printers.find('POS-58-Series')
        const config = qz.configs.create(printer)

        const data = [
            '\x1B\x40',                          // init
            '\x1B\x61\x01',                      // centra
            '\x1B\x21\x30',                      // font grande
            'AIA DI LAZZARO\n',
            '\x1B\x21\x00',                      // font normale
            '\x1B\x61\x00',                      // sinistra
            '--------------------------------\n',
            `Tavolo: ${order.table.number} - ${order.name}\n`,
            `Ordine #${order.number_order}\n`,
            `Coperti: ${order.peoples}\n`,
            `Ora: ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}\n`,
            '--------------------------------\n\n',

            // Prodotti
            ...order.products.map(p => {
                const qty = p.pivot.qty
                const total = (parseFloat(p.price) * qty).toFixed(2)
                const line = `${qty}x ${p.name}`
                const price = `${total}EUR`
                const spaces = Math.max(1, 32 - line.length - price.length)
                return line + ' '.repeat(spaces) + price + '\n'
            }),

            '--------------------------------\n',

            // Coperto
            (() => {
                const coperto = order.peoples * 2
                const label = `${order.peoples}x Coperto`
                const price = `${coperto.toFixed(2)}EUR`
                const spaces = Math.max(1, 32 - label.length - price.length)
                return label + ' '.repeat(spaces) + price + '\n'
            })(),

            '--------------------------------\n',

            // Totale
            '\x1B\x45\x01',                     // grassetto on
            (() => {
                const label = 'TOTALE:'
                const price = `${parseFloat(order.total_price).toFixed(2)}EUR`
                const spaces = Math.max(1, 32 - label.length - price.length)
                return label + ' '.repeat(spaces) + price + '\n'
            })(),
            '\x1B\x45\x00',                     // grassetto off

            '\n',
            '\x1B\x61\x01',                     // centra
            'Grazie e arrivederci!\n',
            '\n\n\n',
            '\x1D\x56\x42\x00',                 // taglia carta
        ]

        await qz.print(config, data)
        console.log('Preconto inviato ✅')

    } catch (err) {
        console.error('Errore stampa preconto:', err)
    }
}

export { stampaComanda, stampaPreconto }