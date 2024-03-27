
import fs from 'fs'
import { utilService } from './util.service.js'
const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
    query,
    getById,
    save,
    remove
}

function query(filterBy, sort) {
    // console.log('filterBy', filterBy)
    // no need - 
    // if (!filterBy&& !sort) return Promise.resolve(toys)

    let filteredToys = toys
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }
    // only if filter by label is required 
    // if (filterBy.labels && filterBy.labels.length) {
    //     const labelsToFilter = filterBy.labels.filter(l=>l)
    //     filteredToys = filteredToys.filter(toy =>  labelsToFilter.every(label => toy.labels.includes(label)))
    // }

    if (filterBy.inStock) {
        filteredToys = filteredToys.filter(toy => toy.inStock === JSON.parse(filterBy.inStock))
    }

   

    filterBy.maxPrice = (+filterBy.maxPrice) ? +filterBy.maxPrice : Infinity
    filterBy.minPrice = (+filterBy.minPrice) ? +filterBy.minPrice : -Infinity

    filteredToys = filteredToys.filter(toy => (toy.price <= filterBy.maxPrice) && (toy.price >= filterBy.minPrice))


    // sort either by price or by name - when sorting by string we need more 
    // complex conditions, thats for you to figure out ;)
    // we use the asc key in the sort to determin which way to sort
    // ascending or descending. so when we change the number to pos \ neg 
    // it will change the direction of the sort
    filteredToys.sort((toy1, toy2) => {
        const dir = JSON.parse(sort.asc) ? 1 : -1
        if (sort.by === 'price') return (toy1.price - toy2.price) * dir
        if (sort.by === 'name') return toy1.name.localeCompare(toy2.name) * dir
        // add date 
    })

    return Promise.resolve(filteredToys);
}

function getById(_id) {
    const toy = toys.find(toy => toy._id === _id)
    //
    return Promise.resolve(toy);
}

function remove(_id) {
    const idx = toys.findIndex(toy => toy._id === _id)
    toys.splice(idx, 1);
    _saveToysToFile()
    return Promise.resolve();
}

function save(toy) {
    if (toy._id) {
        const idx = toys.findIndex(currToy => currToy._id === toy._id)
        toys[idx] = { ...toys[idx], ...toy }
    } else {
        toy.createdAt = new Date(Date.now());
        toy._id = _makeId();
        toys.unshift(toy);
    }
    _saveToysToFile();
    return Promise.resolve(toy);
}



function _makeId(length = 5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}

function _saveToysToFile() {
    fs.writeFileSync('data/toy.json', JSON.stringify(toys, null, 2));
}
