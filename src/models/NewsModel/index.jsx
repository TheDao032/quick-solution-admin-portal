//
import Model from '../Model';
//
import NewsEntity from '../NewsEntity';

// Util(s)
// import { jqxGridColumns } from '../../utils/jqwidgets';

/**
 * @class StatusDataLeadModel
 */
export default class NewsModel extends Model
{
  /**
   * @var {String} redux store::state key
   */
  _stateKeyName = 'news';

  /**
   * @var {String}
   */
  static NEWS_NEWS_LIST = 'news';
  /** @var {String} */
  static NEWS_NEWS_DETAIL = 'news/:id';
  /** @var {String} */
  static NEWS_NEWS_OPTS = 'news/get-options';
  /** @var {String} */
  static NEWS_NEWS_CHANGE_STATUS = 'news/:id/change-status';
  /** @var {String} */
  static API_EXPORT_EXCEL = 'news/export-excel';
  /** @var {String} */
  static API_GET_TAG = 'news/get-tag';
  /** @var {String} */
  static API_GET_META_KEYWORD = 'news/get-meta-keyword';
  /** @var {String} */
  static API_CHECK_TAG = 'news/check-tag';
  /** @var {String} */
  static API_CHECK_META_KEYWORD = 'news/check-meta-keyword';

  /**
   * @var {String} Primary Key
   */
  primaryKey = 'news_id';

  /**
   * Column datafield prefix
   * @var {String}
   */
  static columnPrefix = '';
  /** @var {String} */
  static defaultImgBase64 = NewsEntity.defaultImgBase64;

  /**
   * @return {Object}
   */
  fillable = () => ({
    "news_id": null,
    "news_title": null,
    "news_date": null,
    "short_description": null,
    "content":  null,
    "author_full_name": null,
    "news_source": null,
    "is_video": 0,
    "video_link": null,
    "news_status_id": 0,
    "news_category_id": null,
    "news_tag":  [],
    "meta_key_words": [],
    "meta_description": null,
    "meta_title": null,
    "seo_name": null,
    "image_file_id": null,
    "image_url": null,
    "small_thumbnail_image_file_id": 0,
    "small_thumbnail_image_url": null,
    "medium_thumbnail_image_file_id":  0,
    "medium_thumbnail_image_url": null,
    "large_thumbnail_image_file_id": 0,
    "large_thumbnail_image_url": null,
    "xlarge_thumbnail_image_file_id":  0,
    "xlarge_thumbnail_image_url":  null,
    "view_count": 0,
    "comment_count": 0,
    "like_count": 0,
    "order_index": 0,
    "is_show_home": 0,
    "is_high_light": 0,
    "is_show_notify": 0,
    "is_hot_news": 0,
    "is_system": 0,
    "is_active": 1,
    "auth_name": null,
});

  findOne(_opts = {})
  {
    // Fetch data
    let dataList = this.dataList(_opts);

    // Filters
    return dataList[0] || null;
  }

  getTag(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_GET_TAG, data);
  }

  getMetaKeyword(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_GET_META_KEYWORD, data);
  }

  checkTag(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_CHECK_TAG, data);
  }

  checkMetaKeyword(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.API_CHECK_META_KEYWORD, data);
  }

  /**
   *
   */
  getList(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.get(_static.NEWS_NEWS_LIST, data);
  }

  /**
   * Get options (list opiton)
   * @param {Object} opts
   * @returns Promise
   */
  getOptions(opts)
  {
    return this._api.get(_static.NEWS_NEWS_OPTS, opts);
  }

  /**
   * Get options (list opiton) for won/lost
   * @param {Object} _opts
   * @returns Promise
   */
  getOptionsWonLost(_opts = {})
  {
    let optsIsWon = {
      is_won: _opts.is_won || 1
    };
    let optsIsLost = {
      is_lost: _opts.is_lost || 1
    };

    return Promise.all([
      this.getOptions(optsIsWon),
      this.getOptions(optsIsLost)
    ])
      .then(dataArr => {
        let [dataIsWon, dataIsLost] = dataArr;
        let data = [];
        dataIsWon.forEach(item => data.push({...item, is_won: 1 }));
        dataIsLost.forEach(item => data.push({...item, is_lost: 1 }));
        return data;
      });
  }

  /**
   * Get options (list opiton)
   * @returns Promise
   */
  getOptionsFull(_opts)
  {
    // Format options
    let opts = _opts || {};
    let apiOpts = Object.assign({
      itemsPerPage: _static._MAX_ITEMS_PER_PAGE,
      exclude_id: []
    }, opts['_api']);
    delete opts['_api'];

    //
    return this.getList(apiOpts)
      .then(({ items }) => {
        let excludeIdStr = "|" + apiOpts.exclude_id.join('|') + "|";
        let ret = (items || []).map(
          ({ user_group_id: id, user_group_name: name, description }) => {
              // Nam trong list exclude --> set null
              if (excludeIdStr.indexOf("|" + id + "|") >= 0) {
                return null;
              }
              return ({ name, id, description });
            }
        );
        // Filter null items
        return ret.filter(item => item);
      });
  }

  /**
   *
   */
  create(_data = {})
  {
    // Validate data?! 
    let data = Object.assign({}, this.fillable(), _data); 
    data.small_thumbnail_image_file_id = (data.small_thumbnail_image_file_id.toString().trim()== "") ? "0" : data.small_thumbnail_image_file_id.toString().trim();
    data.medium_thumbnail_image_file_id = (data.medium_thumbnail_image_file_id.toString().trim() == "") ? "0" : data.medium_thumbnail_image_file_id.toString().trim();
    data.large_thumbnail_image_file_id =  (data.large_thumbnail_image_file_id.toString().trim() == "")? "0": data.large_thumbnail_image_file_id.toString().trim();
    data.xlarge_thumbnail_image_file_id = (data.xlarge_thumbnail_image_file_id.toString().trim()=="")? "0" : data.xlarge_thumbnail_image_file_id.toString().trim();
    return this._api.post(_static.NEWS_NEWS_LIST, data);
  }
/**
   *
   */
  update(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    data.small_thumbnail_image_file_id = (data.small_thumbnail_image_file_id.toString().trim()== "") ? "0" : data.small_thumbnail_image_file_id.toString().trim();
    data.medium_thumbnail_image_file_id = (data.medium_thumbnail_image_file_id.toString().trim() == "") ? "0" : data.medium_thumbnail_image_file_id.toString().trim();
    data.large_thumbnail_image_file_id =  (data.large_thumbnail_image_file_id.toString().trim() == "")? "0": data.large_thumbnail_image_file_id.toString().trim();
    data.xlarge_thumbnail_image_file_id = (data.xlarge_thumbnail_image_file_id.toString().trim()=="")? "0" : data.xlarge_thumbnail_image_file_id.toString().trim();
    return this._api.put(_static.NEWS_NEWS_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  edit(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    data.is_won = (data.order === "1") ? 1: 0;
    data.is_lost = (data.order === "2") ? 1: 0;
    return this._api.put(_static.NEWS_NEWS_DETAIL.replace(':id', id), data);
  }
  /**
   *
   */
  changeStatus(id, _data)
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    return this._api.put(_static.NEWS_NEWS_CHANGE_STATUS.replace(':id', id), data);
  }
  /**
   * @return {Promise}
   */
  delete(id, _data = {})
  {
    // Validate data?!
    return this._api.delete(_static.NEWS_NEWS_DETAIL.replace(':id', id));
  }

  /**
   *
   */
  read(id, _data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    //
    let as = this._api.get(_static.NEWS_NEWS_DETAIL.replace(':id', id), data)
    .then((data) => new NewsEntity(data));
    return this._api.get(_static.NEWS_NEWS_DETAIL.replace(':id', id), data)
      .then((data) => new NewsEntity(data))
    ;
  }

  /**
   *
   */
  exportExcel(opts)
  {
    const header = {
      responseType: 'blob',
    }
    return this._api.get(_static.API_EXPORT_EXCEL, opts, header);
  }

    /**
   * @return {Promise}
   */
  init(_data = {})
  {
    // Validate data?!
    let data = Object.assign({}, _data);
    // console.log('User#init: ', data);
    //
    return this._api.post(_static.NEWS_NEWS_INIT, data);
  }
}
// Make alias
const _static = NewsModel;
